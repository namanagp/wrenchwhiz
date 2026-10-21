import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, ErrorBox } from './ui.jsx';

export default function Overview({ vehicle, profile, mode, go, onRecalls }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);

  const load = () => {
    setData(null); setError(null);
    api.recalls(vehicle).then((d) => { setData(d); onRecalls?.(d.recalls); }).catch(setError);
  };
  useEffect(load, [vehicle.year, vehicle.make, vehicle.model]); // eslint-disable-line react-hooks/exhaustive-deps

  const recalls = data?.recalls || [];
  const urgent = recalls.filter((r) => r.parkIt || r.parkOutside);

  return (
    <div className="stack">
      <Card className="hero-card">
        <div className="hero-card-top">
          <div>
            <p className="eyebrow">Your vehicle</p>
            <h2>{profile?.label}</h2>
            {vehicle.engine && <p className="muted">{[vehicle.trim, vehicle.engine, vehicle.drive, vehicle.fuel].filter(Boolean).join(' · ')}</p>}
          </div>
          <div className="car-emoji" aria-hidden>{profile?.bodyType === 'truck' ? '🛻' : profile?.bodyType === 'suv' ? '🚙' : profile?.bodyType === 'van' ? '🚐' : '🚗'}</div>
        </div>
        <div className="tags">{profile?.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        <p className="muted small">{profile?.timing.note}</p>
      </Card>

      <div className="grid-4">
        {[
          ['maintenance', '🗓️', 'Maintenance', 'What\'s due & when'],
          ['symptoms', '🩺', 'Symptom checker', 'Weird noise? Light on?'],
          ['guides', '🔧', 'DIY guides', 'Step-by-step jobs'],
          ['prices', '💵', 'Fair prices', 'Don\'t get overcharged'],
        ].map(([tab, icon, title, sub]) => (
          <button key={tab} className="action-card" onClick={() => go(tab)}>
            <span className="action-icon">{icon}</span><strong>{title}</strong><span className="muted small">{sub}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="section-head">
          <h3>🚨 Safety recalls</h3>
          {data && <span className={`count-pill ${recalls.length ? 'warn' : 'ok'}`}>{recalls.length} on file</span>}
        </div>
        <p className="muted small">Live from the U.S. National Highway Traffic Safety Administration (NHTSA). Recall repairs are free at a dealer. Check your VIN at <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noreferrer">nhtsa.gov/recalls</a> to see if yours was already fixed.</p>
        <ErrorBox error={error} onRetry={load} />
        {!data && !error && <Spinner label="Checking NHTSA recalls…" />}
        {data && !recalls.length && <div className="empty">✅ No recalls found for the {profile?.label} in NHTSA's database.</div>}
        {urgent.length > 0 && <div className="error-box">⛔ {urgent.length} recall(s) carry a <strong>Park It / Park Outside</strong> warning. Contact a dealer before driving.</div>}
        <div className="recall-list">
          {recalls.map((r) => (
            <div key={r.campaign} className={`recall ${open === r.campaign ? 'open' : ''}`}>
              <button className="recall-head" onClick={() => setOpen(open === r.campaign ? null : r.campaign)}>
                <span>
                  <strong>{r.component.split(':').slice(0, 2).join(' › ')}</strong>
                  <span className="muted small"> · #{r.campaign} · {r.date}</span>
                </span>
                <span className="chev">{open === r.campaign ? '−' : '+'}</span>
              </button>
              {open === r.campaign && (
                <div className="recall-body">
                  {mode === 'beginner'
                    ? <p><strong>What it means:</strong> {r.consequence || r.summary}</p>
                    : <><p><strong>Summary:</strong> {r.summary}</p><p><strong>Consequence:</strong> {r.consequence}</p></>}
                  <p><strong>Fix:</strong> {r.remedy}</p>
                  <a href={r.url} target="_blank" rel="noreferrer">View on NHTSA →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {data?.complaints && data.complaints.total > 0 && (
        <Card>
          <div className="section-head"><h3>📊 What owners report</h3><span className="count-pill">{data.complaints.total.toLocaleString()} complaints</span></div>
          <p className="muted small">Owner complaints filed with NHTSA for this year/make/model, grouped by system. Complaints are unverified reports, not confirmed defects.</p>
          <div className="bars">
            {data.complaints.top.map((c) => (
              <div className="bar-row" key={c.component}>
                <span className="bar-label">{c.component.toLowerCase()}</span>
                <span className="bar"><span style={{ width: `${(c.count / data.complaints.top[0].count) * 100}%` }} /></span>
                <span className="bar-val">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
