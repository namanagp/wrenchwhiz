// End-to-end API smoke test: every feature x 2+ vehicles x both modes.
// Usage: npm test   (server must be running; BASE defaults to http://localhost:5180)
const BASE = process.env.BASE || 'http://localhost:5180';
const VEHICLES = [
  { year: 2015, make: 'Honda', model: 'Civic', vehicleType: 'car' },
  { year: 2020, make: 'Ford', model: 'F-150', vehicleType: 'truck' },
  { year: 2021, make: 'Tesla', model: 'Model 3', vehicleType: 'car' },
];
let pass = 0; let fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✔', msg); } else { fail++; console.log('  ✘', msg); } };
const get = (p) => fetch(BASE + p).then((r) => r.json());
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then((r) => r.json());

const makes = await get('/api/makes');
ok(makes.total > 100 && makes.popular.some((m) => m.name === 'Toyota'), `makes from NHTSA vPIC: ${makes.total}`);

for (const v of VEHICLES) {
  const label = `${v.year} ${v.make} ${v.model}`;
  console.log(`\n${label}`);
  const models = await get(`/api/models?make=${v.make}&year=${v.year}`);
  ok(models.some((m) => m.name.toLowerCase() === v.model.toLowerCase()), `vPIC models include ${v.model} (${models.length} models)`);
  const rc = await get(`/api/recalls?make=${v.make}&model=${v.model}&year=${v.year}`);
  ok(Array.isArray(rc.recalls), `recalls: ${rc.recalls.length}, complaints: ${rc.complaints?.total}`);
  for (const mode of ['beginner', 'diy']) {
    const m = await post('/api/maintenance', { vehicle: v, mode, mileage: 58000 });
    ok(m.items?.length >= 10, `[${mode}] maintenance: ${m.items.length} items, ${m.items.filter((i) => i.status === 'due').length} due; tags=${m.profile.tags.join('/')}`);
    const s = await post('/api/symptoms', { vehicle: v, mode, text: 'grinding noise when I brake' });
    ok(s.urgency === 'stop' && s.causes.length > 0, `[${mode}] symptom brake grinding -> ${s.urgency}, top cause: ${s.causes[0]?.name}`);
    const s2 = await post('/api/symptoms', { vehicle: v, mode, text: 'car won\'t start, just clicking' });
    ok(s2.causes.length > 0, `[${mode}] symptom no-start -> ${s2.urgency}, top cause: ${s2.causes[0]?.name}`);
    const gl = await post('/api/guides', { vehicle: v });
    ok(gl.guides.length >= 5, `guides available: ${gl.guides.length}`);
    const g = await post('/api/guides/brake-pads', { vehicle: v, mode });
    ok(g.steps?.length > 3 && (mode === 'beginner' ? !!g.canDiy : g.specs.length > 0), `[${mode}] brake pad guide: ${g.steps.length} steps${mode === 'diy' ? `, spec: ${g.specs[0].slice(0, 60)}…` : `, canDiy: ${g.canDiy}`}`);
    const pr = await post('/api/prices', { vehicle: v });
    const bp = pr.estimates.find((e) => e.id === 'brake-pads-front');
    ok(bp && bp.shop.high > bp.diy.high, `prices: ${pr.estimates.length} jobs; front pads DIY $${bp.diy.low}-${bp.diy.high}, shop $${bp.shop.low}-${bp.shop.high}`);
    const c = await post('/api/chat', { vehicle: v, mode, messages: [{ role: 'user', content: 'How often should I change my oil?' }], context: { mileage: 58000 } });
    ok(typeof c.reply === 'string' && c.reply.length > 20, `[${mode}] chat (${c.source}): ${c.reply.slice(0, 90).replace(/\n/g, ' ')}…`);
  }
}
const vin = await get('/api/vin/1FTEW1EP5LFA00000');
ok(vin.make && vin.model, `VIN decode: ${vin.year} ${vin.make} ${vin.model} ${vin.engine}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
