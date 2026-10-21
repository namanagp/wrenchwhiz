import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { Markdown, SourceBadge, Disclaimer } from './ui.jsx';

const STARTERS = {
  beginner: ['Is it safe to drive with my check engine light on?', 'How often should I change my oil?', 'How much should front brakes cost?', 'Does my car have a timing belt?'],
  diy: ['How do I change the engine air filter?', 'What oil does my engine take?', 'How do I replace front brake pads?', 'My car cranks but won\'t start'],
};

export default function Chat({ vehicle, mode, profile, ai, mileage, recalls, go }) {
  const key = `ww-chat-${vehicle.year}-${vehicle.make}-${vehicle.model}`;
  const [messages, setMessages] = useState(() => { try { return JSON.parse(sessionStorage.getItem(key)) || []; } catch { return []; } });
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { sessionStorage.setItem(key, JSON.stringify(messages.slice(-30))); endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, key]);

  const send = async (content = text) => {
    if (!content.trim() || busy) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next); setText(''); setBusy(true);
    try {
      const recallSummary = recalls?.length ? recalls.map((r) => `${r.campaign} (${r.component})`).join('; ') : '';
      const r = await api.chat(vehicle, mode, next.map(({ role, content: c }) => ({ role, content: c })), { mileage, recallCount: recalls?.length, recallSummary });
      setMessages([...next, { role: 'assistant', content: r.reply, source: r.source, provider: r.provider, note: r.note, links: r.links }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `Sorry, something went wrong: ${e.message}`, source: 'error' }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="chat">
      <div className="chat-head">
        <div className="avatar">🧑‍🔧</div>
        <div className="grow"><strong>Ask a mechanic</strong><div className="muted small">Knows you drive a {profile?.label} · {mode === 'diy' ? 'DIY mode' : 'Beginner mode'}</div></div>
        <span className={`badge ${ai?.enabled ? 'ai' : 'kb'}`}>{ai?.enabled ? `✨ AI · ${ai.provider}` : '📚 Offline mode'}</span>
        {messages.length > 0 && <button className="btn ghost sm" onClick={() => setMessages([])}>Clear</button>}
      </div>
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>👋 Hi! Ask me anything about your {profile?.label}: weird noises, what's due, how to fix something, or whether a quote is fair.</p>
            <div className="quick-picks">{STARTERS[mode].map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'assistant' && <div className="msg-avatar">🧑‍🔧</div>}
            <div className="bubble">
              <Markdown text={m.content} />
              {m.links?.length > 0 && <div className="row-actions">{m.links.map((l) => <button key={l.label} className="btn ghost sm" onClick={() => go(l.tab, { guideId: l.guideId, query: l.query })}>{l.label} →</button>)}</div>}
              {m.role === 'assistant' && m.source !== 'error' && <div className="msg-foot"><SourceBadge source={m.source} provider={m.provider} />{m.note && <span className="muted tiny">{m.note}</span>}</div>}
            </div>
          </div>
        ))}
        {busy && <div className="msg assistant"><div className="msg-avatar">🧑‍🔧</div><div className="bubble typing"><span /><span /><span /></div></div>}
        <div ref={endRef} />
      </div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask about your ${profile?.model || 'car'}…`} aria-label="Message" />
        <button className="btn primary" disabled={busy || !text.trim()}>Send</button>
      </form>
      <Disclaimer>AI and knowledge-base answers can be wrong. For safety-critical repairs, consult a qualified mechanic.</Disclaimer>
    </div>
  );
}
