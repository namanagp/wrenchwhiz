import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as nhtsa from './nhtsa.js';
import * as llm from './llm.js';
import { buildProfile, buildSchedule, listGuides, getGuide, checkSymptom, generateGuide, chat, SAFETY, PRICE_DISCLAIMER } from './assistant.js';
import { allEstimates, DEFAULT_LABOR_RATE } from './kb/prices.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '200kb' }));

const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req, res)); } catch (e) {
    console.error(`[api] ${req.method} ${req.path}:`, e.message);
    res.status(e.status || 502).json({ error: e.message || 'Something went wrong' });
  }
};
const bad = (msg) => Object.assign(new Error(msg), { status: 400 });
const vehicleFrom = (b) => {
  const v = b?.vehicle;
  if (!v?.year || !v?.make || !v?.model) throw bad('vehicle {year, make, model} is required');
  return v;
};
const modeFrom = (b) => (b?.mode === 'diy' ? 'diy' : 'beginner');

app.get('/api/health', (req, res) => res.json({ ok: true, ai: llm.providerInfo(), safety: SAFETY }));

// --- NHTSA passthroughs ---
app.get('/api/makes', wrap(() => nhtsa.getMakes()));
app.get('/api/models', wrap((req) => {
  const { make, year } = req.query;
  if (!make || !/^\d{4}$/.test(String(year))) throw bad('make and 4-digit year required');
  return nhtsa.getModels(String(make), String(year));
}));
app.get('/api/recalls', wrap(async (req) => {
  const { make, model, year } = req.query;
  if (!make || !model || !year) throw bad('make, model, year required');
  const [recalls, complaints] = await Promise.all([
    nhtsa.getRecalls(make, model, year),
    nhtsa.getComplaintsSummary(make, model, year).catch(() => null),
  ]);
  return { recalls, complaints, source: 'NHTSA (api.nhtsa.gov)' };
}));
app.get('/api/vin/:vin', wrap((req) => {
  const vin = String(req.params.vin).toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (vin.length !== 17) throw bad('A VIN has 17 characters (no I, O or Q)');
  return nhtsa.decodeVin(vin);
}));

// --- Knowledge features ---
app.post('/api/profile', wrap((req) => buildProfile(vehicleFrom(req.body))));
app.post('/api/maintenance', wrap((req) => {
  const p = buildProfile(vehicleFrom(req.body));
  return { profile: p, ...buildSchedule(p, req.body.mileage, modeFrom(req.body)) };
}));
app.post('/api/symptoms', wrap((req) => {
  const text = String(req.body.text || '').trim();
  if (text.length < 3) throw bad('Describe the symptom in a few words');
  return checkSymptom({ vehicle: vehicleFrom(req.body), mode: modeFrom(req.body), text: text.slice(0, 1000) });
}));
app.post('/api/guides', wrap((req) => ({ guides: listGuides(buildProfile(vehicleFrom(req.body))) })));
app.post('/api/guides/generate', wrap((req) => {
  const topic = String(req.body.topic || '').trim();
  if (topic.length < 3) throw bad('Enter a repair topic');
  return generateGuide({ vehicle: vehicleFrom(req.body), mode: modeFrom(req.body), topic: topic.slice(0, 200) });
}));
app.post('/api/guides/:id', wrap((req) => {
  const g = getGuide(req.params.id, buildProfile(vehicleFrom(req.body)), modeFrom(req.body));
  if (!g) throw Object.assign(new Error('Guide not found'), { status: 404 });
  return g;
}));
app.post('/api/prices', wrap((req) => {
  const p = buildProfile(vehicleFrom(req.body));
  const lr = req.body.laborRate;
  const rate = lr && Number(lr.low) > 0 && Number(lr.high) >= Number(lr.low) ? { low: Number(lr.low), high: Number(lr.high) } : DEFAULT_LABOR_RATE;
  return { profile: p, laborRate: rate, estimates: allEstimates(p, rate), disclaimer: PRICE_DISCLAIMER };
}));
app.post('/api/chat', wrap((req) => {
  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  if (!messages.length) throw bad('messages required');
  return chat({ vehicle: vehicleFrom(req.body), mode: modeFrom(req.body), messages, context: req.body.context || {} });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// --- Static frontend ---
const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('Frontend not built. Run "npm start" (builds + serves) or "npm run dev".'));
}

const PORT = Number(process.env.PORT) || 5180;
app.listen(PORT, () => {
  const ai = llm.providerInfo();
  console.log(`Motorlingo running at http://localhost:${PORT}`);
  console.log(ai.enabled ? `AI: ${ai.provider} (${ai.model})` : 'AI: off (no OPENROUTER_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY) - using built-in knowledge base');
});
