import React from 'react';

export const Card = ({ className = '', children, ...rest }) => <div className={`card ${className}`} {...rest}>{children}</div>;

export const Spinner = ({ label = 'Loading…' }) => <div className="spinner-wrap"><span className="spinner" /> {label}</div>;

export const ErrorBox = ({ error, onRetry }) => error ? (
  <div className="error-box">⚠️ {String(error.message || error)} {onRetry && <button className="btn ghost sm" onClick={onRetry}>Retry</button>}</div>
) : null;

export const Difficulty = ({ level }) => (
  <span className="difficulty" title={`Difficulty ${level}/5`}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} className={`dot ${i <= level ? 'on' : ''}`} />)}
    <span className="difficulty-label">{['', 'Easy', 'Easy', 'Moderate', 'Hard', 'Pro'][level]}</span>
  </span>
);

export const Urgency = ({ level, label }) => {
  const map = { safe: ['🟢', 'Safe to drive'], soon: ['🟠', 'Fix soon'], stop: ['🔴', 'Stop driving'] };
  const [emoji, text] = map[level] || ['⚪', 'Unknown'];
  return <span className={`urgency ${level}`}>{emoji} {label || text}</span>;
};

export const SourceBadge = ({ source, provider }) => source === 'ai'
  ? <span className="badge ai">✨ AI · {provider?.provider}</span>
  : <span className="badge kb">📚 Curated knowledge base</span>;

export const Disclaimer = ({ children }) => (
  <p className="disclaimer">⚠️ {children || 'General guidance only. For brakes, steering, suspension, tires, fuel, airbags and high-voltage parts, consult a qualified mechanic.'}</p>
);

export const money = (n) => `$${Number(n).toLocaleString()}`;

// Tiny, safe markdown: escapes HTML then supports **bold**, line breaks and "- " bullets.
export function Markdown({ text }) {
  const esc = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const blocks = esc.split(/\n{2,}/).map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${l.replace(/^\s*([-*•]|\d+[.)])\s+/, '')}</li>`).join('')}</ul>`;
    }
    return `<p>${lines.join('<br/>')}</p>`;
  }).join('');
  const html = blocks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}
