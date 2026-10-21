// Business logic for symptom checks, guides and chat, with AI + curated fallbacks.
import { buildProfile } from './kb/profile.js';
import { buildSchedule } from './kb/maintenance.js';
import { matchSymptoms, SYMPTOMS } from './kb/symptoms.js';
import { getGuide, listGuides, findGuideByTopic } from './kb/guides.js';
import { estimate, JOBS, PRICE_DISCLAIMER } from './kb/prices.js';
import * as llm from './llm.js';

export const SAFETY = 'For safety-critical systems (brakes, steering, suspension, tires, fuel, airbags, high-voltage EV parts), consult a qualified mechanic. This app gives general guidance, not a professional inspection.';

const URGENCY_LABEL = { safe: 'Safe to drive (schedule it)', soon: 'Fix soon (within days)', stop: 'Stop driving / get it towed' };
const URGENCY_RANK = { safe: 0, soon: 1, stop: 2 };

function modeInstructions(mode) {
  return mode === 'diy'
    ? 'The user is in DIY MODE: they want hands-on detail. Include tools, parts, difficulty (1-5), time, safety notes, and say exact torque/capacity specs must be confirmed in the factory service manual for their exact engine/trim (only give typical ranges).'
    : 'The user is in BEGINNER MODE: no jargon (explain any term you use), focus on "should I worry?", what it means, whether it is safe to drive, and when to go to a shop. Keep it short and reassuring but honest.';
}

function vehicleContext(p, extra = {}) {
  return `Vehicle: ${p.label}. Class: ${p.tags.join(', ')}. ${p.timing.note} ${p.oil ? `Oil guidance: ${p.oil.type}, ${p.oil.range} mi.` : 'Electric: no engine oil.'}${extra.recalls ? ` Open NHTSA recalls on file: ${extra.recalls}.` : ''}`;
}

// ---------- Symptom checker ----------
function kbSymptom(text, p, mode) {
  const matches = matchSymptoms(text, p);
  if (!matches.length) return null;
  const urgency = matches.reduce((u, s) => (URGENCY_RANK[s.urgency] > URGENCY_RANK[u] ? s.urgency : u), 'safe');
  const causes = [];
  for (const [i, s] of matches.entries()) {
    for (const c of s.causes) {
      let w = c.weight;
      if (c.boostIf && new RegExp(c.boostIf, 'i').test(text)) w *= 1.8;
      if (c.penalizeIf && new RegExp(c.penalizeIf, 'i').test(text)) w *= 0.4;
      causes.push({ ...c, score: w * (i === 0 ? 1 : 0.55), from: s.title });
    }
  }
  causes.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const unique = causes.filter((c) => (seen.has(c.name) ? false : seen.add(c.name)));
  causes.length = 0; causes.push(...unique);
  const total = causes.reduce((n, c) => n + c.score, 0);
  const top = causes.slice(0, 5).map((c) => ({
    name: c.name, likelihood: Math.round((c.score / total) * 100), why: c.why, fix: c.diy ? 'DIY possible' : 'Shop recommended', diy: c.diy,
    guideId: c.guideId, price: c.priceId ? estimate(c.priceId, p) : null,
  }));
  const primary = matches[0];
  return {
    source: 'curated', matched: matches.map((s) => s.title), urgency, urgencyLabel: URGENCY_LABEL[urgency],
    summary: mode === 'diy' ? `Most likely: ${top[0].name}. ${primary.checks[0] || ''}` : primary.beginner,
    causes: top, checks: matches.flatMap((s) => s.checks).slice(0, 4),
    advice: urgency === 'stop' ? 'Do not keep driving. Have it towed or have a mobile mechanic come to you.' : urgency === 'soon' ? 'Plan a fix within the next few days and avoid long trips until then.' : 'Safe to drive for now. Schedule a check at your convenience.',
  };
}

export async function checkSymptom({ vehicle, mode, text }) {
  const p = buildProfile(vehicle);
  const kb = kbSymptom(text, p, mode);
  if (llm.isEnabled()) {
    try {
      const system = `You are an experienced, honest ASE-certified mechanic helping a car owner. ${modeInstructions(mode)}
${vehicleContext(p)}
Return JSON: {"summary": string, "urgency": "safe"|"soon"|"stop", "causes": [{"name": string, "likelihood": integer percent (all sum ~100), "why": string, "diy": boolean, "jobId": one of [${Object.keys(JOBS).join(', ')}] or null}], "checks": [string], "advice": string}.
Rank 3-5 causes. Be conservative with urgency for brakes, steering, overheating, fuel smell, smoke. Never invent recalls or statistics.`;
      const ai = await llm.completeJSON({ system, messages: [{ role: 'user', content: `Symptom: ${text}` }], maxTokens: 900 });
      const urgency = ['safe', 'soon', 'stop'].includes(ai.urgency) ? ai.urgency : (kb?.urgency || 'soon');
      return {
        source: 'ai', provider: llm.providerInfo(), urgency, urgencyLabel: URGENCY_LABEL[urgency], summary: ai.summary, checks: ai.checks || [], advice: ai.advice,
        causes: (ai.causes || []).slice(0, 5).map((c) => ({ name: c.name, likelihood: c.likelihood, why: c.why, diy: !!c.diy, fix: c.diy ? 'DIY possible' : 'Shop recommended',
          price: c.jobId && JOBS[c.jobId] ? estimate(c.jobId, p) : null, guideId: c.jobId ? findGuideByTopic(c.jobId.replace(/-/g, ' ')) : null })),
        matched: kb?.matched || [],
      };
    } catch (e) { console.warn('[llm] symptom fallback:', e.message); }
  }
  if (kb) return kb;
  return {
    source: 'curated', matched: [], urgency: 'soon', urgencyLabel: 'Not sure yet; get it checked', causes: [],
    summary: 'I couldn\'t match that to a common symptom in the offline knowledge base. Try describing what you hear, feel, see or smell, and when it happens (braking, turning, starting, highway speed).',
    checks: ['When does it happen (cold start, braking, turning, accelerating, at speed)?', 'Any warning lights on the dashboard?', 'Any noise, smell, smoke or leak?'],
    advice: 'If anything feels unsafe (brakes, steering, smoke, overheating), stop driving and call a mechanic.',
    suggestions: SYMPTOMS.slice(0, 8).map((s) => s.title),
  };
}

// ---------- Guides ----------
export async function generateGuide({ vehicle, mode, topic }) {
  const p = buildProfile(vehicle);
  const kbId = findGuideByTopic(topic);
  if (llm.isEnabled()) {
    try {
      const system = `You write safe, accurate step-by-step car repair guides. ${modeInstructions(mode)}
${vehicleContext(p)}
Return JSON: {"title": string, "difficulty": 1-5, "time": string, "summary": string, "whenShop": string, "tools": [string], "parts": [string], "safety": [string], "specs": [string, typical ranges only, each noting to confirm in service manual], "steps": [{"title": string, "detail": string, "tip": string}]}.
If the job is dangerous for amateurs (airbags, high-voltage, fuel lines, A/C refrigerant, timing), say so in whenShop and keep steps high-level.`;
      const g = await llm.completeJSON({ system, messages: [{ role: 'user', content: `Guide for: ${topic}` }], maxTokens: 1600 });
      return { id: 'ai-' + Date.now(), icon: '🤖', source: 'ai', provider: llm.providerInfo(), ...g };
    } catch (e) { console.warn('[llm] guide fallback:', e.message); }
  }
  if (kbId) return { ...getGuide(kbId, p, mode), note: `Closest curated guide for "${topic}". Custom AI-generated guides turn on when an API key is added.` };
  return { notFound: true, message: `No curated guide matches "${topic}" yet. Custom AI-generated guides for any repair activate when an OpenAI or Anthropic API key is added.`, available: listGuides(p) };
}

// ---------- Chat ----------
const INTENTS = [
  { re: /(how much|cost|price|quote|charge|expensive|overcharg|rip.?off)/, kind: 'price' },
  { re: /(how (do|to|can) i|replace|change|install|diy|myself|steps|guide)/, kind: 'guide' },
  { re: /(when|how often|interval|schedule|maintenance|service|due|miles)/, kind: 'maint' },
  { re: /(recall)/, kind: 'recall' },
  { re: /(belt|chain)/, kind: 'timing' },
  { re: /(oil|synthetic|viscosity|0w|5w)/, kind: 'oil' },
];

function ruleBasedChat(text, p, mode, ctx) {
  const q = text.toLowerCase();
  const sym = kbSymptom(text, p, mode);
  const parts = [];
  const links = [];

  if (sym && sym.causes.length && !/how much|cost|price/.test(q)) {
    parts.push(`For your ${p.label}, that sounds like **${sym.matched[0].toLowerCase()}**. Urgency: **${sym.urgencyLabel}**.`);
    parts.push(mode === 'diy' ? `Most likely causes: ${sym.causes.slice(0, 3).map((c) => `${c.name} (~${c.likelihood}%)`).join('; ')}.` : sym.summary);
    if (sym.checks[0]) parts.push(`Quick check: ${sym.checks[0]}`);
    links.push({ tab: 'symptoms', label: 'Open full symptom check', query: text });
  }
  const kinds = INTENTS.filter((i) => i.re.test(q)).map((i) => i.kind);
  if (kinds.includes('timing')) parts.push(p.timing.note);
  if (kinds.includes('oil') && p.oil) {
    const e = estimate('oil-change', p);
    parts.push(mode === 'diy'
      ? `Oil for the ${p.label}: ${p.oil.type}. Typical interval ${p.oil.range} miles; capacity is usually ${p.oilQuarts} for this class (confirm the exact viscosity on the oil cap and capacity in your manual). ${p.oil.note} Parts run about $${e.diy.low}-$${e.diy.high}; see the Oil change guide for steps.`
      : `For a ${p.label}, plan on an oil change about every ${p.oil.range} miles (or when the oil-life reminder on your dash says so). ${p.oil.note} At a shop it typically costs about $${e.shop.low}-$${e.shop.high}. If you're overdue by a few hundred miles, don't panic, just book it soon.`);
    if (mode === 'diy') links.push({ tab: 'guides', label: 'Open guide: Change the engine oil & filter', guideId: 'oil-change' });
  }
  if (kinds.includes('oil') && p.isEV) parts.push(`Good news: the ${p.label} is electric, so there's no engine oil to change.`);
  if (kinds.includes('recall')) parts.push(ctx.recallCount != null ? `NHTSA lists ${ctx.recallCount} recall campaign(s) for the ${p.label}. See the Overview tab for details; recall repairs are free at a dealer.` : 'Check the Overview tab for NHTSA recalls; recall repairs are free at a dealer.');
  if (kinds.includes('price') || kinds.includes('guide')) {
    const gid = findGuideByTopic(q);
    const jobId = Object.keys(JOBS).find((id) => q.includes(id.replace(/-/g, ' ')) || JOBS[id].name.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => q.includes(w)));
    if (kinds.includes('price') && jobId) {
      const e = estimate(jobId, p);
      parts.push(`Typical estimate for **${e.name}** on a ${p.label}: DIY ~$${e.diy.low}-$${e.diy.high} in parts; shop ~$${e.shop.low}-$${e.shop.high}. A quote much above ~$${e.redFlag} is worth a second opinion. (Estimate, not a quote.)`);
      links.push({ tab: 'prices', label: 'See all price estimates' });
    }
    if (kinds.includes('guide') && gid) {
      const g = getGuide(gid, p, mode);
      if (g && !g.notApplicable) {
        parts.push(mode === 'diy' ? `**${g.title}**: difficulty ${g.difficulty}/5, ${g.time}. Steps: ${g.steps.map((s, i) => `${i + 1}) ${s.title}`).join(' ')}.` : `**${g.title}** is ${g.canDiy?.toLowerCase()} It takes about ${g.time}. ${g.whenShop}`);
        links.push({ tab: 'guides', label: `Open guide: ${g.title}`, guideId: gid });
      }
    }
  }
  if (kinds.includes('maint') && !parts.length) {
    const s = buildSchedule(p, ctx.mileage || 0, mode);
    const due = s.items.filter((i) => i.status !== 'ok');
    parts.push(due.length ? `At ${Number(ctx.mileage).toLocaleString()} miles, coming up: ${due.slice(0, 4).map((i) => i.name).join(', ')}.` : `Key intervals for the ${p.label}: ${s.items.slice(0, 5).map((i) => `${i.name} every ${i.intervalMiles.toLocaleString()} mi`).join('; ')}.`);
    links.push({ tab: 'maintenance', label: 'Open maintenance schedule' });
  }
  if (!parts.length) {
    parts.push(`I'm your offline mechanic for the ${p.label}. I can help with symptoms (e.g. "grinding when I brake"), maintenance ("when is my next service?"), DIY how-tos ("how do I change the air filter?"), prices ("how much for front brakes?"), and recalls.`);
  }
  return { reply: parts.join('\n\n'), links };
}

export async function chat({ vehicle, mode, messages = [], context = {} }) {
  const p = buildProfile(vehicle);
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  if (llm.isEnabled()) {
    try {
      const system = `You are "WrenchWise", a friendly, honest master mechanic chatting with the owner of a ${p.label}. ${modeInstructions(mode)}
${vehicleContext(p, { recalls: context.recallSummary })}
Current mileage (if given): ${context.mileage || 'unknown'}.
Rules: Be specific to this vehicle where you're confident and say when something varies by engine/trim. Give urgency (safe to drive / fix soon / stop driving) for any symptom. Price figures are rough U.S. estimates, label them as estimates. Never fabricate sources, recalls, TSB numbers or exact torque specs. For brakes, steering, airbags, fuel leaks, high-voltage parts: recommend a professional when in doubt. Use short paragraphs and bullet lists; under 220 words.`;
      const reply = await llm.complete({ system, messages: messages.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 4000) })), maxTokens: 700 });
      return { reply, source: 'ai', provider: llm.providerInfo(), links: [] };
    } catch (e) { console.warn('[llm] chat fallback:', e.message); }
  }
  const rb = ruleBasedChat(last, p, mode, context);
  return { ...rb, source: 'curated', note: llm.isEnabled() ? 'The AI provider could not be reached, so this answer comes from the built-in knowledge base.' : 'Offline mode: answers come from the built-in knowledge base. Full conversational AI activates when an OpenAI or Anthropic API key is added.' };
}

export { buildProfile, buildSchedule, listGuides, getGuide, PRICE_DISCLAIMER };
