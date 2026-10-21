// Screenshots of AI-powered screens (requires a configured API key on the running server).
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5180';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
if (!health.ai?.enabled) { console.error('AI is not enabled on the server; add an API key first.'); process.exit(1); }
const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const civic = 'y=2015&mk=Honda&md=Civic&t=car';
async function open(hash) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('init')) { localStorage.clear(); localStorage.setItem('ww-mileage', '59200'); sessionStorage.setItem('init', '1'); } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(90000);
  await p.goto(`${BASE}/#${hash}`, { waitUntil: 'networkidle' });
  return p;
}

let p = await open(`${civic}&tab=chat&mode=beginner`);
await p.click('.chip:has-text("check engine")');
await p.waitForSelector('.msg.assistant .md');
await p.fill('.chat-input input', 'And roughly what would a fix cost if it turns out to be an O2 sensor?');
await p.click('.chat-input button');
await p.waitForFunction(() => document.querySelectorAll('.msg.assistant .md').length >= 2);
await p.waitForTimeout(1200);
await p.screenshot({ path: OUT + '09-ai-chat-civic-beginner.png' });
console.log('saved', OUT + '09-ai-chat-civic-beginner.png');

p = await open(`${civic}&tab=symptoms&mode=diy`);
await p.fill('textarea', 'Whining noise that gets louder when I accelerate, and the car feels a bit sluggish');
await p.click('button:has-text("Check symptom")');
await p.waitForSelector('.badge.ai');
await p.addStyleTag({ content: '.topbar{position:static!important}' });
await p.waitForTimeout(400);
await p.screenshot({ path: OUT + '10-ai-symptom-civic-diy.png', fullPage: true });
console.log('saved', OUT + '10-ai-symptom-civic-diy.png');
await browser.close();
