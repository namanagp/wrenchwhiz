# 🔧 WrenchWise: a car repair companion

**Know your car. Skip the upsell.** WrenchWise is a mobile-friendly web app for people who don't know much about cars, and for budding DIYers who want to learn. Pick any year, make and model (or decode a VIN) and get guidance tuned to *that* vehicle:

| Feature | What it does |
|---|---|
| 🚗 **Vehicle picker** | 400+ makes and every model/year, live from the free **NHTSA vPIC** API. Optional VIN decode (engine, trim, drive). |
| 🚨 **Recalls & owner complaints** | Live **NHTSA recalls** for the exact year/make/model, with "Park It" warnings, plus a chart of what owners complain about most. |
| 🌱/🔧 **Beginner ↔ DIY mode** | One toggle changes every screen. Beginner: plain English, "should I worry?", when to see a shop. DIY: tools, parts, difficulty, time, safety notes, torque/spec caveats. |
| 🗓️ **Maintenance schedule** | Mileage-based plan (oil, tires, brakes, fluids, filters, spark plugs…) adapted to the car: era-appropriate oil interval, **timing belt vs chain**, CVT fluid, AWD/4x4 fluids, EV- and hybrid-specific items. Enter your mileage to see what's due now. |
| 🩺 **Symptom checker** | Describe a noise, smell, light or feeling → ranked likely causes, an urgency verdict (**safe to drive / fix soon / stop driving**), DIY vs shop, and cost ranges. |
| 📋 **Step-by-step DIY guides** | 10 curated guides (oil change, brake pads, battery, filters, wipers, tire rotation, coolant, spark plugs, headlights) with a progress checklist. With an API key, it can generate a guide for any repair. |
| 💵 **Fair price estimates** | DIY parts cost vs shop cost (parts + labor) for 40 common jobs, scaled for vehicle class (luxury, truck, EV…), an adjustable labor-rate slider, and a **quote checker** that flags quotes that are too high. |
| 💬 **Ask a mechanic** | A chat that already knows your car, your mode, your mileage and your recalls. |

> ⚠️ All estimates and AI content are general guidance, labeled as such. For brakes, steering, suspension, tires, fuel, airbags and high-voltage EV parts, consult a qualified mechanic.

## Run it

Requires Node.js 18+.

```bash
npm install
npm start          # builds the frontend and serves everything on http://localhost:5180
```

Other scripts:

```bash
npm run dev          # hot-reload dev mode: Vite on :5173 (proxying /api) + API on :5180
npm test             # end-to-end API smoke test (server must be running)
npm run screenshots  # headless Playwright screenshots into ./screenshots
```

Set `PORT=xxxx` to change the port.

## Add an AI key (optional)

The app works **fully without a key** using its built-in knowledge base. To turn on full AI:

```bash
cp .env.example .env
# then set ONE of (OpenRouter is preferred when several are set):
OPENROUTER_API_KEY=sk-or-...  # optional OPENROUTER_MODEL (default openai/gpt-4.1-mini), OPENROUTER_SITE_URL / OPENROUTER_APP_NAME
OPENAI_API_KEY=sk-...         # optional OPENAI_MODEL (default gpt-4o-mini), OPENAI_BASE_URL for compatible APIs
ANTHROPIC_API_KEY=sk-ant-...  # optional ANTHROPIC_MODEL (default claude-haiku-4-5)
```

Keys can also come from real environment variables (these override `.env`). Use `LLM_PROVIDER=openrouter|openai|anthropic` to force a provider. With [OpenRouter](https://openrouter.ai), one key unlocks hundreds of models; change `OPENROUTER_MODEL` to any ID from `https://openrouter.ai/api/v1/models`. The app sends the optional `HTTP-Referer` and `X-Title` attribution headers.

Restart the server. The header badge switches from "📚 Offline mode" to "✨ AI".

| | Without a key | With a key |
|---|---|---|
| Vehicle picker, VIN decode, recalls, complaints | ✅ (NHTSA, live) | ✅ |
| Maintenance schedule, price estimates, quote checker | ✅ curated KB | ✅ curated KB |
| Symptom checker | ✅ keyword matching over 18 common symptoms | ✅ AI analysis of any free-text description (falls back to KB on error) |
| DIY guides | ✅ 10 curated guides; search finds the closest | ✅ plus AI-generated guides for any repair |
| Chat | ✅ rule-based answers (symptoms, prices, how-tos, oil, timing belt, recalls) | ✅ full conversational mechanic with vehicle + mode + recall context |

If an AI call fails, every feature falls back to the knowledge base automatically.

## Tech stack

- **Frontend:** React 19 + Vite, hand-written CSS (dark glassmorphism theme, responsive with a mobile bottom tab bar). No UI framework.
- **Backend:** Node.js + Express 5, one process that serves the API and the built frontend.
- **Data:** [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) (makes, models, VIN decode), [NHTSA Recalls & Complaints](https://www.nhtsa.gov/nhtsa-datasets-and-apis) (cached in memory for 12h).
- **AI layer:** `server/llm.js`, a small provider-agnostic adapter: one shared OpenAI-compatible client (used for OpenRouter and OpenAI) plus Anthropic Messages, all via `fetch`, with JSON-mode for structured output. It picks a provider from env vars, so adding another provider means adding one object.
- **Knowledge base:** `server/kb/`
  - `profile.js` builds a vehicle profile from year/make/model (body type, EV/hybrid, luxury, timing belt vs chain, likely CVT, AWD, cost multiplier)
  - `maintenance.js`, `symptoms.js`, `guides.js`, `prices.js` are curated content adapted to that profile
- **Testing:** `scripts/smoke-test.mjs` (50 checks across 3 vehicles × 2 modes) and Playwright screenshots.

```
car-companion/
├── server/            Express API, NHTSA client, LLM adapter, assistant logic
│   └── kb/            curated knowledge base
├── src/               React app (App.jsx + components/)
├── scripts/           smoke test + screenshot scripts
└── screenshots/       PNGs of key screens
```

## Honest limitations

- Maintenance intervals, specs and prices are **typical ranges for the vehicle class**, not pulled from each manufacturer's service manual. The app says so everywhere and points users to their owner's manual.
- Timing belt/chain and CVT detection uses a rules table for popular models; other vehicles show "check your engine" guidance.
- NHTSA recall lookups depend on NHTSA's model naming; a few models (e.g. trim-specific names) may return no recalls even if some exist. The app links to nhtsa.gov to check by VIN.

## Screenshots

See [`screenshots/`](screenshots/): home/picker, recalls overview, maintenance (list + timeline), symptom checker (desktop + mobile), DIY guide, guide list, prices/quote checker and chat.
