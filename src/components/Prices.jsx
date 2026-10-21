import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';
import { Card, Spinner, ErrorBox, Disclaimer, money } from './ui.jsx';

export default function Prices({ vehicle, mode, profile, priceId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [rate, setRate] = useState({ low: 110, high: 180 });
  const [q, setQ] = useState('');
  const [quote, setQuote] = useState({ job: priceId || '', amount: '' });
  const focusRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => api.prices(vehicle, rate).then(setData).catch(setError), 200);
    return () => clearTimeout(t);
  }, [vehicle.year, vehicle.make, vehicle.model, rate.low, rate.high]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (data && priceId && focusRef.current) focusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [data, priceId]);

  const list = useMemo(() => (data?.estimates || []).filter((e) => e.name.toLowerCase().includes(q.toLowerCase())), [data, q]);
  const checked = data?.estimates.find((e) => e.id === quote.job);
  const amt = Number(String(quote.amount).replace(/[^\d.]/g, ''));
  let verdict = null;
  if (checked && amt > 0) {
    if (amt < checked.shop.low * 0.8) verdict = ['ok', 'That\'s below the typical range. Make sure it includes quality parts and labor.'];
    else if (amt <= checked.shop.high) verdict = ['ok', 'That\'s within the typical range. Looks fair.'];
    else if (amt <= checked.redFlag) verdict = ['soon', 'A bit above typical. Fine for dealers or premium parts; ask what\'s included.'];
    else verdict = ['stop', 'Well above typical. Ask for an itemized quote and get a second opinion.'];
  }

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Spinner label="Estimating prices…" />;
  return (
    <div className="stack">
      <Card>
        <h3>💵 Fair price estimates · {profile?.label}</h3>
        <p className="muted small">{data.disclaimer}</p>
        {profile?.costMultiplier !== 1 && <p className="spec-note">ℹ️ Adjusted ×{profile.costMultiplier} for this vehicle class ({profile.tags.filter((t) => /Luxury|Exotic|Truck|SUV|Electric|Van/.test(t)).join(', ') || 'class'}).</p>}
        <div className="rate-row">
          <label className="field"><span>Shop labor rate: {money(rate.low)}–{money(rate.high)}/hr</span>
            <input type="range" min="70" max="250" step="5" value={rate.high} onChange={(e) => { const high = Number(e.target.value); setRate({ low: Math.min(rate.low, high), high }); }} />
          </label>
          <label className="field"><span>Low end</span>
            <input type="range" min="60" max="200" step="5" value={rate.low} onChange={(e) => { const low = Number(e.target.value); setRate({ low, high: Math.max(rate.high, low) }); }} />
          </label>
        </div>
      </Card>

      <Card className="quote-check">
        <h3>🧾 Got a quote? Check it</h3>
        <div className="picker-row">
          <select className="input" value={quote.job} onChange={(e) => setQuote({ ...quote, job: e.target.value })}>
            <option value="">Select the job…</option>
            {data.estimates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input className="input" inputMode="decimal" placeholder="Quoted $" value={quote.amount} onChange={(e) => setQuote({ ...quote, amount: e.target.value })} />
        </div>
        {verdict && <div className={`verdict ${verdict[0]}`}><strong>{money(amt)}</strong> vs typical shop {money(checked.shop.low)}–{money(checked.shop.high)}: {verdict[1]}</div>}
      </Card>

      <input className="input" placeholder="Filter jobs (e.g. brake, battery)…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="price-list">
        {list.map((e) => {
          const max = Math.max(e.shop.high, 1);
          return (
            <Card key={e.id} className={`price-item ${e.id === priceId ? 'focus' : ''}`} ref={e.id === priceId ? focusRef : undefined}>
              <div className="section-head wrap"><strong>{e.name}</strong><span className="muted small">{e.shop.laborHours[0]}–{e.shop.laborHours[1]} labor hrs</span></div>
              <div className="range-row"><span className="range-label">🔧 DIY</span>
                <span className="range-track"><span className="range-fill diy" style={{ left: `${(e.diy.low / max) * 100}%`, width: `${Math.max(((e.diy.high - e.diy.low) / max) * 100, 2)}%` }} /></span>
                <span className="range-val">{e.diy.high === 0 ? 'Free' : `${money(e.diy.low)}–${money(e.diy.high)}`}</span></div>
              <div className="range-row"><span className="range-label">🏪 Shop</span>
                <span className="range-track"><span className="range-fill shop" style={{ left: `${(e.shop.low / max) * 100}%`, width: `${Math.max(((e.shop.high - e.shop.low) / max) * 100, 2)}%` }} /></span>
                <span className="range-val">{money(e.shop.low)}–{money(e.shop.high)}</span></div>
              {mode === 'diy'
                ? <p className="muted small">Tools: {e.diy.tools}</p>
                : <p className="muted small">{e.diy.high > 0 && e.shop.low - e.diy.high > 50 ? `Doing it yourself could save roughly ${money(e.shop.low - e.diy.high)}+.` : 'Small savings from DIY; a shop is a fine choice.'} Quotes above ~{money(e.redFlag)} deserve a second opinion.</p>}
            </Card>
          );
        })}
      </div>
      <Disclaimer>These are estimates, not quotes. Real prices depend on your region, the shop, part brands and your exact engine/trim.</Disclaimer>
    </div>
  );
}
