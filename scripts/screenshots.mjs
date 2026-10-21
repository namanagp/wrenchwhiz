// Headless screenshots of key screens. Usage: npm run screenshots (server running on BASE).
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5180';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

async function page({ hash = '', mileage = 0, mobile = false } = {}) {
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript((m) => { if (!sessionStorage.getItem('init')) { localStorage.clear(); localStorage.setItem('ww-mileage', String(m)); sessionStorage.setItem('init', '1'); } }, mileage);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${hash}`, { waitUntil: 'networkidle' });
  return p;
}
const veh = (y, mk, md, t) => `y=${y}&mk=${encodeURIComponent(mk)}&md=${encodeURIComponent(md)}&t=${t}`;
const civic = veh(2015, 'Honda', 'Civic', 'car');
const f150 = veh(2020, 'Ford', 'F-150', 'truck');
const shot = async (p, name, full = true) => { if (full) await p.addStyleTag({ content: '.topbar{position:static!important}' }); await p.waitForTimeout(400); await p.screenshot({ path: OUT + name, fullPage: full }); console.log('saved', OUT + name); };

// 1. Home / picker with selections filled in
let p = await page();
await p.selectOption('select[aria-label="Model year"]', '2015');
await p.selectOption('select[aria-label="Make"]', 'Honda');
await p.waitForFunction(() => document.querySelector('select[aria-label="Model"]').options.length > 2);
await p.selectOption('select[aria-label="Model"]', 'Civic');
await shot(p, '01-home-picker.png');

// 2. Overview with recalls (F-150)
p = await page({ hash: `#${f150}&tab=overview&mode=beginner` });
await p.waitForSelector('.recall');
await p.click('.recall-head');
await shot(p, '02-overview-recalls-f150.png');

// 3. Maintenance schedule (Civic @ 58k, beginner)
p = await page({ hash: `#${civic}&tab=maintenance&mode=beginner`, mileage: 59200 });
await p.waitForSelector('.maint-item');
await shot(p, '03-maintenance-civic-beginner.png');
await p.click('text=DIY');
await p.waitForTimeout(600);
await p.click('text=By mileage');
await shot(p, '03b-maintenance-timeline-civic-diy.png');

// 4. Symptom checker result (F-150, DIY)
p = await page({ hash: `#${f150}&tab=symptoms&mode=diy` });
await p.fill('textarea', 'Grinding noise when I brake, and the steering wheel shakes when stopping');
await p.click('button:has-text("Check symptom")');
await p.waitForSelector('.cause');
await shot(p, '04-symptom-checker-f150-diy.png');
p = await page({ hash: `#${civic}&tab=symptoms&mode=beginner` });
await p.click('.chip:has-text("Temperature gauge")');
await p.waitForSelector('.cause');
await shot(p, '04b-symptom-checker-civic-beginner.png');

// 5. DIY guide (F-150 brake pads, DIY mode)
p = await page({ hash: `#${f150}&tab=guides&mode=diy&guide=brake-pads` });
await p.waitForSelector('.steps');
await p.click('.steps li:nth-child(1) label');
await p.click('.steps li:nth-child(2) label');
await shot(p, '05-diy-guide-brakes-f150.png');
p = await page({ hash: `#${civic}&tab=guides&mode=beginner` });
await p.waitForSelector('.guide-card');
await shot(p, '05b-guides-list-civic.png');

// 6. Prices with quote checker
p = await page({ hash: `#${civic}&tab=prices&mode=beginner` });
await p.waitForSelector('.price-item');
await p.selectOption('.quote-check select', 'brake-pads-front');
await p.fill('.quote-check input', '650');
await shot(p, '06-prices-civic.png', false);

// 7. Chat (Civic beginner, two questions)
p = await page({ hash: `#${civic}&tab=chat&mode=beginner` });
await p.click('.chip:has-text("check engine")');
await p.waitForSelector('.msg.assistant .md');
await p.fill('.chat-input input', 'How much should front brake pads cost?');
await p.click('.chat-input button');
await p.waitForFunction(() => document.querySelectorAll('.msg.assistant .md').length >= 2);
await p.waitForTimeout(1200);
await shot(p, '07-chat-civic-beginner.png');

// 8. Mobile views
p = await page({ hash: `#${f150}&tab=symptoms&mode=beginner`, mobile: true });
await p.click('.chip:has-text("won")');
await p.waitForSelector('.cause');
await p.evaluate(() => document.querySelector('.urgency-card').scrollIntoView({ block: 'start' }));
await p.evaluate(() => window.scrollBy(0, -150));
await shot(p, '08-mobile-symptoms-f150.png', false);
p = await page({ mobile: true });
await shot(p, '08b-mobile-home.png', false);

await browser.close();
