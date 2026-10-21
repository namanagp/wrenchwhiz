import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, ErrorBox, Urgency, SourceBadge, Disclaimer, money } from './ui.jsx';

const EXAMPLES = ['Grinding noise when I brake', 'Car won\'t start, just clicking', 'Steering wheel shakes on the highway', 'Check engine light is on', 'Temperature gauge is high and I see steam', 'A/C blowing warm air'];

export default function Symptoms({ vehicle, mode, profile, go, initialQuery }) {
  const [text, setText] = useState(initialQuery || '');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (q = text) => {
    if (!q.trim()) return;
    setText(q); setBusy(true); setError(null);
    try { setResult(await api.symptoms(vehicle, mode, q)); } catch (e) { setError(e); } finally { setBusy(false); }
  };
  useEffect(() => { if (initialQuery) run(initialQuery); }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (result && text) run(text); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="stack">
      <Card>
        <h3>🩺 What's going on with your {profile?.label}?</h3>
        <p className="muted small">Describe what you hear, feel, see or smell, and when it happens.</p>
        <form className="symptom-form" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Grinding noise when I brake, worse in the morning" />
          <button className="btn primary" disabled={busy || text.trim().length < 3}>{busy ? 'Checking…' : 'Check symptom'}</button>
        </form>
        <div className="quick-picks">{EXAMPLES.map((e) => <button key={e} className="chip" onClick={() => run(e)}>{e}</button>)}</div>
      </Card>
      <ErrorBox error={error} />
      {busy && <Spinner label="Diagnosing…" />}
      {result && !busy && (
        <>
          <Card className={`result urgency-card ${result.urgency}`}>
            <div className="section-head wrap">
              <Urgency level={result.urgency} label={result.urgencyLabel} />
              <SourceBadge source={result.source} provider={result.provider} />
            </div>
            {result.matched?.length > 0 && <p className="muted small">Matched: {result.matched.join(' · ')}</p>}
            <p className="lead">{result.summary}</p>
            <p><strong>What to do:</strong> {result.advice}</p>
          </Card>
          {result.causes.length > 0 && (
            <Card>
              <h3>Likely causes, ranked</h3>
              <div className="causes">
                {result.causes.map((c, i) => (
                  <div className="cause" key={c.name}>
                    <div className="cause-head">
                      <span className="rank">{i + 1}</span>
                      <strong className="grow">{c.name}</strong>
                      <span className={`pill ${c.diy ? 'diy' : 'shop'}`}>{c.diy ? '🔧 DIY possible' : '🏪 Shop job'}</span>
                    </div>
                    <div className="likely"><span style={{ width: `${c.likelihood}%` }} /><em>{c.likelihood}% of likely causes</em></div>
                    <p className="muted small">{c.why}</p>
                    <div className="row-actions">
                      {c.price && <span className="price-inline">💵 DIY {money(c.price.diy.low)}–{money(c.price.diy.high)} · Shop {money(c.price.shop.low)}–{money(c.price.shop.high)} <em>(est.)</em></span>}
                      {c.guideId && mode === 'diy' && <button className="btn ghost sm" onClick={() => go('guides', { guideId: c.guideId })}>Open DIY guide</button>}
                      {c.guideId && mode === 'beginner' && c.diy && <button className="btn ghost sm" onClick={() => go('guides', { guideId: c.guideId })}>Could I do this myself?</button>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {result.checks?.length > 0 && (
            <Card>
              <h3>{mode === 'diy' ? 'Diagnostic checks' : 'Quick things you can check'}</h3>
              <ul className="checklist">{result.checks.map((c) => <li key={c}>{c}</li>)}</ul>
            </Card>
          )}
          {result.suggestions && <div className="quick-picks">{result.suggestions.map((s) => <button key={s} className="chip" onClick={() => run(s)}>{s}</button>)}</div>}
          <Disclaimer>Likelihoods are rough rankings for a typical vehicle, not a diagnosis. Price ranges are estimates. When brakes, steering, smoke or overheating are involved, stop and consult a professional.</Disclaimer>
        </>
      )}
    </div>
  );
}
