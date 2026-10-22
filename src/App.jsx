import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import Picker from './components/Picker.jsx';
import Overview from './components/Overview.jsx';
import Maintenance from './components/Maintenance.jsx';
import Symptoms from './components/Symptoms.jsx';
import Guides from './components/Guides.jsx';
import Prices from './components/Prices.jsx';
import Chat from './components/Chat.jsx';

const TABS = [
  ['overview', '🏠', 'Overview'],
  ['maintenance', '🗓️', 'Schedule'],
  ['symptoms', '🩺', 'Symptoms'],
  ['guides', '🔧', 'Guides'],
  ['prices', '💵', 'Prices'],
  ['chat', '💬', 'Mechanic'],
];

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

function readHash() {
  const h = new URLSearchParams(window.location.hash.slice(1));
  const v = h.get('y') && h.get('mk') && h.get('md') ? { year: Number(h.get('y')), make: h.get('mk'), model: h.get('md'), vehicleType: h.get('t') || 'car' } : null;
  return { vehicle: v, tab: h.get('tab'), mode: h.get('mode'), guide: h.get('guide') };
}

export default function App() {
  const fromHash = readHash();
  const [vehicle, setVehicle] = useState(fromHash.vehicle || load('ml-vehicle', null));
  const [mode, setMode] = useState(fromHash.mode || load('ml-mode', 'beginner'));
  const [tab, setTab] = useState(fromHash.tab || 'overview');
  const [mileage, setMileage] = useState(load('ml-mileage', 0));
  const [profile, setProfile] = useState(null);
  const [ai, setAi] = useState(null);
  const [guideId, setGuideId] = useState(fromHash.guide || null);
  const [priceId, setPriceId] = useState(null);
  const [symptomQuery, setSymptomQuery] = useState('');
  const [recalls, setRecalls] = useState(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => { api.health().then((h) => setAi(h.ai)).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem('ml-mode', JSON.stringify(mode)); }, [mode]);
  useEffect(() => { localStorage.setItem('ml-mileage', JSON.stringify(mileage)); }, [mileage]);
  useEffect(() => {
    localStorage.setItem('ml-vehicle', JSON.stringify(vehicle));
    setProfile(null); setRecalls(null);
    if (vehicle) {
      api.profile(vehicle).then(setProfile).catch(() => {});
      api.recalls(vehicle).then((d) => setRecalls(d.recalls)).catch(() => {});
    }
  }, [vehicle]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  const go = (t, opts = {}) => {
    if (opts.guideId !== undefined) setGuideId(opts.guideId);
    else if (t === 'guides') setGuideId(null);
    if (opts.priceId) setPriceId(opts.priceId);
    if (opts.query) setSymptomQuery(opts.query);
    setTab(t);
  };

  const pick = (v) => { setVehicle(v); setTab('overview'); setGuideId(null); setChanging(false); setMileage(0); };

  const ModeToggle = (
    <div className="segmented mode-toggle" role="radiogroup" aria-label="Mode">
      <button role="radio" aria-checked={mode === 'beginner'} className={mode === 'beginner' ? 'on' : ''} onClick={() => setMode('beginner')}>🌱 Beginner</button>
      <button role="radio" aria-checked={mode === 'diy'} className={mode === 'diy' ? 'on' : ''} onClick={() => setMode('diy')}>🔧 DIY</button>
    </div>
  );

  if (!vehicle) {
    return (
      <div className="landing">
        <header className="topbar"><Brand />{ModeToggle}</header>
        <main className="landing-main">
          <section className="hero">
            <p className="eyebrow">Your car, explained</p>
            <h1>Know your car.<br /><span className="grad">Skip the upsell.</span></h1>
            <p className="hero-sub">Pick your car and get a maintenance schedule, a symptom checker, step-by-step DIY guides, fair price ranges and a mechanic you can ask anything, all tuned to your exact year, make and model.</p>
          </section>
          <div className="card picker-card"><Picker onPick={pick} /></div>
          <section className="features">
            {[
              ['🗓️', 'Maintenance schedule', 'Mileage-based plan for oil, tires, brakes, fluids, filters and timing belt vs chain.'],
              ['🩺', 'Symptom checker', 'Ranked likely causes with a clear safe / soon / stop-driving verdict.'],
              ['🔧', 'DIY guides', 'Tools, parts, safety and steps. Beginner or hands-on detail.'],
              ['💵', 'Fair prices', 'DIY vs shop estimates and a quote checker so you know when it\'s too high.'],
              ['💬', 'Ask a mechanic', 'Chat that already knows which car you drive.'],
              ['🚨', 'Live NHTSA recalls', 'Official recalls and owner-complaint trends for your car.'],
            ].map(([i, t, d]) => <div key={t} className="feature"><span className="feature-icon">{i}</span><strong>{t}</strong><span className="muted small">{d}</span></div>)}
          </section>
          <p className="muted small center">Vehicle data from NHTSA vPIC & Recalls APIs. Guidance is general; consult a professional for safety-critical work.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <Brand onClick={() => setTab('overview')} />
        <button className="vehicle-chip" onClick={() => setChanging(!changing)} title="Change vehicle">
          <span>{profile?.bodyType === 'truck' ? '🛻' : profile?.bodyType === 'suv' ? '🚙' : '🚗'}</span>
          <span className="vehicle-chip-text">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          <span className="muted">▾</span>
        </button>
        {ModeToggle}
      </header>
      {changing && <div className="change-bar"><Picker onPick={pick} compact initial={vehicle} /><button className="btn ghost sm" onClick={() => { setVehicle(null); setChanging(false); }}>Start over</button></div>}
      <nav className="tabs" aria-label="Sections">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => go(id)} aria-current={tab === id}>
            <span className="tab-icon">{icon}</span><span className="tab-label">{label}</span>
            {id === 'overview' && recalls?.length > 0 && <span className="tab-dot">{recalls.length}</span>}
          </button>
        ))}
      </nav>
      <main className="content">
        <div className={`mode-banner ${mode}`}>{mode === 'beginner' ? '🌱 Beginner mode: plain English, "should I worry?", and when to see a shop.' : '🔧 DIY mode: tools, parts, difficulty, specs and safety notes.'}</div>
        {tab === 'overview' && <Overview vehicle={vehicle} profile={profile} mode={mode} go={go} onRecalls={setRecalls} />}
        {tab === 'maintenance' && <Maintenance vehicle={vehicle} mode={mode} mileage={mileage} setMileage={setMileage} go={go} />}
        {tab === 'symptoms' && <Symptoms vehicle={vehicle} mode={mode} profile={profile} go={go} initialQuery={symptomQuery} />}
        {tab === 'guides' && <Guides vehicle={vehicle} mode={mode} profile={profile} guideId={guideId} setGuideId={setGuideId} ai={ai} go={go} />}
        {tab === 'prices' && <Prices vehicle={vehicle} mode={mode} profile={profile} priceId={priceId} />}
        {tab === 'chat' && <Chat vehicle={vehicle} mode={mode} profile={profile} ai={ai} mileage={mileage} recalls={recalls} go={go} />}
      </main>
      <footer className="footer muted small">
        Data: NHTSA vPIC, Recalls & Complaints APIs · {ai?.enabled ? `AI: ${ai.provider} (${ai.model})` : 'AI: offline knowledge base (add an API key for full AI)'} · Not a substitute for a professional inspection.
      </footer>
    </div>
  );
}

function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick}>
      <img src="/favicon.svg" alt="" width="30" height="30" />
      <span>Wrench<span className="grad">Whiz</span></span>
    </button>
  );
}
