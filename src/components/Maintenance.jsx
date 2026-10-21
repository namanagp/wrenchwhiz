import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, ErrorBox, Difficulty, Disclaimer } from './ui.jsx';

const STATUS = { due: ['Due now', 'stop'], soon: ['Coming up', 'soon'], ok: ['Later', 'safe'] };

export default function Maintenance({ vehicle, mode, mileage, setMileage, go }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [input, setInput] = useState(mileage || '');

  useEffect(() => {
    setError(null);
    api.maintenance(vehicle, mode, mileage).then(setData).catch(setError);
  }, [vehicle.year, vehicle.make, vehicle.model, mode, mileage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Spinner label="Building your schedule…" />;
  const due = data.items.filter((i) => i.status === 'due');
  const soon = data.items.filter((i) => i.status === 'soon');

  return (
    <div className="stack">
      <Card>
        <div className="section-head wrap">
          <div>
            <h3>🗓️ Maintenance schedule</h3>
            <p className="muted small">Tailored to the {data.profile.label} ({data.profile.tags.slice(0, 3).join(', ').toLowerCase()}).</p>
          </div>
          <form className="mileage" onSubmit={(e) => { e.preventDefault(); setMileage(Number(String(input).replace(/\D/g, '')) || 0); }}>
            <label className="field"><span>Current mileage</span>
              <input className="input" inputMode="numeric" placeholder="e.g. 58,000" value={input} onChange={(e) => setInput(e.target.value)} />
            </label>
            <button className="btn primary sm">Update</button>
          </form>
        </div>
        {data.currentMileage > 0 && (
          <div className="summary-strip">
            <div><strong className="big">{due.length}</strong><span>due now</span></div>
            <div><strong className="big">{soon.length}</strong><span>coming up</span></div>
            <div><strong className="big">{data.currentMileage.toLocaleString()}</strong><span>miles</span></div>
          </div>
        )}
        <div className="segmented small-seg">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>By item</button>
          <button className={view === 'timeline' ? 'on' : ''} onClick={() => setView('timeline')}>By mileage</button>
        </div>
      </Card>

      {view === 'list' ? (
        <div className="maint-list">
          {data.items.map((i) => (
            <Card key={i.id} className={`maint-item status-${i.status}`}>
              <div className="maint-top">
                <span className="maint-icon">{i.icon}</span>
                <div className="grow">
                  <div className="maint-title"><strong>{i.name}</strong>{data.currentMileage > 0 && <span className={`urgency ${STATUS[i.status][1]}`}>{STATUS[i.status][0]}</span>}</div>
                  <div className="muted small">Every {i.intervalMiles.toLocaleString()} mi{i.intervalMonths ? ` or ${i.intervalMonths >= 24 ? `${i.intervalMonths / 12} years` : `${i.intervalMonths} months`}` : ''}
                    {data.currentMileage > 0 && <> · next at <strong>{i.nextDue.toLocaleString()} mi</strong> ({i.milesUntil.toLocaleString()} to go)</>}</div>
                </div>
                {mode === 'diy' && <Difficulty level={i.difficulty} />}
              </div>
              <p>{i.detail}</p>
              {i.specNote && <p className="spec-note">ℹ️ {i.specNote}</p>}
              <p className="muted small"><strong>{mode === 'beginner' ? 'Should I worry?' : 'Urgency'}</strong> {i.worry}</p>
              <div className="row-actions">
                {i.guideId && <button className="btn ghost sm" onClick={() => go('guides', { guideId: i.guideId })}>🔧 How to do it</button>}
                {i.priceId && <button className="btn ghost sm" onClick={() => go('prices', { priceId: i.priceId })}>💵 What it costs</button>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="timeline">
            {data.milestones.map((m) => (
              <div key={m.miles} className={`tl-item ${data.currentMileage >= m.miles ? 'past' : ''}`}>
                <div className="tl-dot" />
                <div><strong>{m.miles.toLocaleString()} miles</strong>
                  <div className="tl-tags">{m.items.map((n) => <span key={n} className="tag">{n}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.notes.map((n) => <Disclaimer key={n}>{n}</Disclaimer>)}
    </div>
  );
}
