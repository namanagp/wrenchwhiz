// Pluggable LLM layer. Picks a provider from environment variables:
//   LLM_PROVIDER=openai|anthropic (optional; auto-detects otherwise)
//   OPENAI_API_KEY (+ optional OPENAI_MODEL, default gpt-4o-mini)
//   ANTHROPIC_API_KEY (+ optional ANTHROPIC_MODEL, default claude-haiku-4-5)
// If no key is configured, isEnabled() returns false and callers fall back to
// the curated knowledge base.

const providers = {
  openai: {
    key: () => process.env.OPENAI_API_KEY,
    model: () => process.env.OPENAI_MODEL || 'gpt-4o-mini',
    async complete({ system, messages, json, maxTokens }) {
      const res = await fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key()}` },
        body: JSON.stringify({
          model: this.model(), max_tokens: maxTokens, temperature: 0.3,
          messages: [{ role: 'system', content: system }, ...messages],
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    },
  },
  anthropic: {
    key: () => process.env.ANTHROPIC_API_KEY,
    model: () => process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    async complete({ system, messages, json, maxTokens }) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.key(), 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: this.model(), max_tokens: maxTokens, temperature: 0.3,
          system: json ? `${system}\n\nRespond with a single valid JSON object only, no prose before or after.` : system,
          messages,
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = await res.json();
      return (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
    },
  },
};

export function activeProvider() {
  const forced = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (forced && providers[forced]?.key()) return forced;
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

export const isEnabled = () => activeProvider() !== null;

export function providerInfo() {
  const name = activeProvider();
  return name ? { enabled: true, provider: name, model: providers[name].model() } : { enabled: false, provider: null, model: null };
}

export async function complete({ system, messages, json = false, maxTokens = 900 }) {
  const name = activeProvider();
  if (!name) throw new Error('No LLM provider configured');
  return providers[name].complete({ system, messages, json, maxTokens });
}

export async function completeJSON(opts) {
  const text = await complete({ ...opts, json: true });
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('LLM did not return JSON');
  return JSON.parse(text.slice(start, end + 1));
}
