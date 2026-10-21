import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { ErrorBox } from './ui.jsx';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 1 - 1981 + 1 }, (_, i) => THIS_YEAR + 1 - i);
export const QUICK_PICKS = [
  { year: 2015, make: 'Honda', model: 'Civic', vehicleType: 'car' },
  { year: 2020, make: 'Ford', model: 'F-150', vehicleType: 'truck' },
  { year: 2018, make: 'Toyota', model: 'RAV4', vehicleType: 'mpv' },
  { year: 2021, make: 'Tesla', model: 'Model 3', vehicleType: 'car' },
  { year: 2012, make: 'Subaru', model: 'Outback', vehicleType: 'mpv' },
];

export default function Picker({ onPick, compact = false, initial }) {
  const [makes, setMakes] = useState(null);
  const [year, setYear] = useState(initial?.year || '');
  const [make, setMake] = useState(initial?.make || '');
  const [models, setModels] = useState([]);
  const [model, setModel] = useState(initial?.model || '');
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState(null);
  const [vin, setVin] = useState('');
  const [vinBusy, setVinBusy] = useState(false);
  const [showAllMakes, setShowAllMakes] = useState(false);

  useEffect(() => { api.makes().then(setMakes).catch(setError); }, []);

  useEffect(() => {
    if (!year || !make) { setModels([]); return; }
    let live = true;
    setLoadingModels(true); setError(null);
    api.models(make, year).then((m) => { if (live) { setModels(m); if (!m.find((x) => x.name === model)) setModel(''); } })
      .catch((e) => live && setError(e)).finally(() => live && setLoadingModels(false));
    return () => { live = false; };
  }, [year, make]); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const g = { car: [], mpv: [], truck: [] };
    for (const m of models) (g[m.type] || g.car).push(m);
    return g;
  }, [models]);

  const submit = (e) => {
    e?.preventDefault();
    const m = models.find((x) => x.name === model);
    if (year && make && model) onPick({ year: Number(year), make, model, vehicleType: m?.type || 'car' });
  };

  const decode = async () => {
    setVinBusy(true); setError(null);
    try {
      const d = await api.vin(vin.trim());
      if (!d.make || !d.model || !d.year) throw new Error(d.errorText?.split(';')[0] || 'Could not decode that VIN');
      const type = /truck/i.test(d.vehicleType || '') ? 'truck' : /multipurpose/i.test(d.vehicleType || '') ? 'mpv' : 'car';
      onPick({ year: Number(d.year), make: d.make, model: d.model, vehicleType: type, vin: d.vin, trim: d.trim, engine: d.engine, fuel: d.fuel, drive: d.drive });
    } catch (e) { setError(e); } finally { setVinBusy(false); }
  };

  return (
    <div className={`picker ${compact ? 'compact' : ''}`}>
      <form className="picker-row" onSubmit={submit}>
        <label className="field">
          <span>Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Model year">
            <option value="">Select year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Make {makes && <em className="muted">({makes.total} from NHTSA)</em>}</span>
          <select value={make} onChange={(e) => { if (e.target.value === '__all') { setShowAllMakes(true); return; } setMake(e.target.value); }} disabled={!makes} aria-label="Make">
            <option value="">{makes ? 'Select make' : 'Loading makes…'}</option>
            {makes && <optgroup label="Popular">{makes.popular.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>}
            {makes && !showAllMakes && <option value="__all">Show all {makes.total} makes…</option>}
            {makes && showAllMakes && <optgroup label="All makes">{makes.others.map((m) => <option key={m.id + m.name} value={m.name}>{m.name}</option>)}</optgroup>}
          </select>
        </label>
        <label className="field grow">
          <span>Model {loadingModels && <em className="muted">loading…</em>}</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!models.length} aria-label="Model">
            <option value="">{!year || !make ? 'Pick year & make first' : loadingModels ? 'Loading…' : models.length ? `Select model (${models.length})` : 'No models found'}</option>
            {grouped.car.length > 0 && <optgroup label="Cars">{grouped.car.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>}
            {grouped.mpv.length > 0 && <optgroup label="SUVs, crossovers & vans">{grouped.mpv.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>}
            {grouped.truck.length > 0 && <optgroup label="Trucks">{grouped.truck.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>}
          </select>
        </label>
        <button className="btn primary" type="submit" disabled={!year || !make || !model}>{compact ? 'Switch car' : 'Let\'s go →'}</button>
      </form>
      {!compact && (
        <>
          <div className="or"><span>or decode a VIN</span></div>
          <div className="picker-row vin-row">
            <input className="input" placeholder="17-character VIN (on your dash or door jamb)" value={vin} maxLength={17}
              onChange={(e) => setVin(e.target.value.toUpperCase())} aria-label="VIN" />
            <button className="btn ghost" onClick={decode} disabled={vin.trim().length !== 17 || vinBusy}>{vinBusy ? 'Decoding…' : 'Decode VIN'}</button>
          </div>
          <div className="quick-picks">
            <span className="muted">Try:</span>
            {QUICK_PICKS.map((q) => <button key={q.model} className="chip" onClick={() => onPick(q)}>{q.year} {q.make} {q.model}</button>)}
          </div>
        </>
      )}
      <ErrorBox error={error} />
    </div>
  );
}
