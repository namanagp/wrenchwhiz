// Local server: `npm start` / `npm run serve`. On Vercel, api/index.js exports the same app.
import app from './app.js';
import * as llm from './llm.js';

const PORT = Number(process.env.PORT) || 5180;
app.listen(PORT, () => {
  const ai = llm.providerInfo();
  console.log(`WrenchWhiz running at http://localhost:${PORT}`);
  console.log(ai.enabled ? `AI: ${ai.provider} (${ai.model})` : 'AI: off (no OPENROUTER_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY) - using built-in knowledge base');
});
