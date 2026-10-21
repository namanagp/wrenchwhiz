import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, ErrorBox, Difficulty, SourceBadge, Disclaimer } from './ui.jsx';

export default function Guides({ vehicle, mode, profile, guideId, setGuideId, ai, go }) {
  const [list, setList] = useState(null);
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState({});

  useEffect(() => { api.guides(vehicle).then((d) => setList(d.guides)).catch(setError); }, [vehicle.year, vehicle.make, vehicle.model]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!guideId) { setGuide(null); return; }
    if (String(guideId).startsWith('ai-')) return;
    setGuide(null); setDone({});
    api.guide(vehicle, mode, guideId).then(setGuide).catch(setError);
  }, [guideId, mode, vehicle.year, vehicle.make, vehicle.model]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const g = await api.generateGuide(vehicle, mode, topic);
      if (g.notFound) { setError(new Error(g.message)); } else { setGuide(g); setGuideId(g.id); setDone({}); }
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  if (guideId && !guide && !error) return <Spinner label="Loading guide…" />;

  if (guide) {
    if (guide.notApplicable) return <Card><p>{guide.message}</p><button className="btn ghost" onClick={() => setGuideId(null)}>← All guides</button></Card>;
    const progress = guide.steps?.length ? Math.round((Object.values(done).filter(Boolean).length / guide.steps.length) * 100) : 0;
    return (
      <div className="stack">
        <button className="btn ghost sm back" onClick={() => setGuideId(null)}>← All guides</button>
        <Card className="guide-hero">
          <div className="section-head wrap">
            <h2>{guide.icon} {guide.title}</h2>
            <SourceBadge source={guide.source} provider={guide.provider} />
          </div>
          <p className="muted">For your {profile?.label} · {mode === 'diy' ? 'DIY mode' : 'Beginner mode'}</p>
          {guide.note && <p className="spec-note">ℹ️ {guide.note}</p>}
          <div className="guide-meta">
            <div><span className="muted small">Difficulty</span><Difficulty level={guide.difficulty} /></div>
            <div><span className="muted small">Time</span><strong>⏱ {guide.time}</strong></div>
            {guide.canDiy && <div className="grow"><span className="muted small">Can I do this?</span><strong>{guide.canDiy}</strong></div>}
          </div>
          <p>{guide.summary}</p>
          <p className="shop-note"><strong>🏪 When to use a shop:</strong> {guide.whenShop}</p>
          {guide.priceId && <button className="btn ghost sm" onClick={() => go('prices', { priceId: guide.priceId })}>💵 Compare DIY vs shop cost</button>}
        </Card>
        <div className="grid-2">
          <Card><h3>🧰 Tools</h3><ul className="checklist">{guide.tools?.map((t) => <li key={t}>{t}</li>)}</ul></Card>
          <Card><h3>📦 Parts</h3><ul className="checklist">{guide.parts?.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="muted small">Confirm exact part numbers with your VIN at a parts store.</p></Card>
        </div>
        <Card className="safety-card"><h3>🦺 Safety first</h3><ul className="checklist">{guide.safety?.map((t) => <li key={t}>{t}</li>)}</ul></Card>
        {mode === 'diy' && guide.specs?.length > 0 && (
          <Card className="spec-card"><h3>📐 Torque & specs</h3><ul className="checklist">{guide.specs.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="muted small">Typical ranges only. Always confirm exact torque specs and capacities in the factory service manual for your engine and trim.</p></Card>
        )}
        <Card>
          <div className="section-head"><h3>Step by step</h3><span className="count-pill">{progress}% done</span></div>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <ol className="steps">
            {guide.steps?.map((s, i) => (
              <li key={i} className={done[i] ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={!!done[i]} onChange={() => setDone({ ...done, [i]: !done[i] })} />
                  <span className="step-num">{i + 1}</span>
                  <span><strong>{s.title}</strong><span className="step-detail">{s.detail}</span>{s.tip && mode === 'diy' && <span className="step-tip">💡 {s.tip}</span>}</span>
                </label>
              </li>
            ))}
          </ol>
        </Card>
        <Disclaimer>This guide is general and may differ from your exact trim. If you're unsure at any step, stop. Brakes, steering and suspension work should be checked by a qualified mechanic if you're new to it.</Disclaimer>
      </div>
    );
  }

  return (
    <div className="stack">
      <Card>
        <h3>🔧 DIY repair guides for your {profile?.label}</h3>
        <p className="muted small">{mode === 'diy' ? 'Tools, parts, specs, safety notes and steps.' : 'Plain-English walkthroughs with a "can I do this?" verdict.'}</p>
        <form className="symptom-form inline" onSubmit={generate}>
          <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={ai?.enabled ? 'Any repair, e.g. "replace rear shocks"' : 'Search, e.g. "air filter", "brakes"'} />
          <button className="btn primary" disabled={busy || topic.trim().length < 3}>{busy ? 'Working…' : ai?.enabled ? '✨ Generate guide' : 'Find guide'}</button>
        </form>
        {!ai?.enabled && <p className="muted small">Custom AI-generated guides for any repair activate when an API key is added.</p>}
      </Card>
      <ErrorBox error={error} />
      {!list ? <Spinner /> : (
        <div className="grid-3">
          {list.map((g) => (
            <button key={g.id} className="guide-card" onClick={() => setGuideId(g.id)}>
              <span className="guide-icon">{g.icon}</span>
              <strong>{g.title}</strong>
              <span className="muted small">{g.summary}</span>
              <span className="guide-foot"><Difficulty level={g.difficulty} /><span className="muted small">⏱ {g.time}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
