// Builds a "vehicle profile" from year/make/model so the curated knowledge base
// can adapt its advice to the specific car. These are heuristics for typical
// vehicles of a class -- the UI always tells users to confirm in the owner's manual.

const LUXURY = ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'lexus', 'acura', 'infiniti', 'porsche', 'land rover',
  'jaguar', 'volvo', 'cadillac', 'lincoln', 'genesis', 'tesla', 'alfa romeo', 'maserati', 'mini', 'polestar', 'lucid', 'rivian'];
const EXOTIC = ['ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls-royce', 'aston martin', 'bugatti', 'lotus'];
const EUROPEAN = ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'volkswagen', 'porsche', 'volvo', 'mini', 'land rover',
  'jaguar', 'fiat', 'alfa romeo', 'saab', 'smart', 'polestar'];
const EV_MAKES = ['tesla', 'rivian', 'lucid', 'polestar', 'fisker'];
const EV_MODELS = ['leaf', 'bolt', 'ioniq 5', 'ioniq 6', 'ioniq electric', 'kona electric', 'mach-e', 'lightning', 'id.4', 'id4',
  'ev6', 'ev9', 'e-tron', 'taycan', 'i3', 'i4', 'ix', 'i7', 'eqs', 'eqe', 'eqb', 'niro ev', 'model 3', 'model s', 'model x',
  'model y', 'cybertruck', 'bz4x', 'solterra', 'lyriq', 'hummer ev', 'blazer ev', 'equinox ev', 'silverado ev', 'prologue', 'zdx', 'ariya', 'xc40 recharge', 'c40', 'mx-30', 'spark ev', 'focus electric', 'e-golf', 'soul ev', 'clarity electric', 'rav4 ev'];
const HYBRID_MODELS = ['prius', 'insight', 'hybrid', 'clarity', 'ioniq', 'niro', 'volt', 'c-max', 'phev', 'plug-in', 'prime', 'energi', '4xe'];
const TRUCK_MODELS = ['f-150', 'f150', 'f-250', 'f-350', 'f-450', 'silverado', 'sierra', 'ram', '1500', '2500', '3500', 'tacoma',
  'tundra', 'ranger', 'colorado', 'canyon', 'frontier', 'titan', 'ridgeline', 'gladiator', 'maverick', 'santa cruz', 'avalanche', 'dakota', 's10', 'cybertruck', 'r1t', 'lightning'];
const SUV_MODELS = ['cr-v', 'rav4', 'explorer', 'escape', 'pilot', 'highlander', 'tahoe', 'suburban', 'yukon', 'wrangler',
  'cherokee', 'grand cherokee', 'compass', 'equinox', 'traverse', 'blazer', 'rogue', 'pathfinder', 'murano', 'armada', 'outback',
  'forester', 'ascent', 'crosstrek', 'tucson', 'santa fe', 'palisade', 'sorento', 'telluride', 'sportage', 'cx-5', 'cx-9', 'cx-30', 'cx-50', 'cx-90',
  '4runner', 'sequoia', 'land cruiser', 'expedition', 'edge', 'bronco', 'durango', 'x1', 'x3', 'x5', 'x7', 'q3', 'q5', 'q7', 'gle', 'glc', 'gls',
  'rx', 'nx', 'gx', 'lx', 'mdx', 'rdx', 'xc60', 'xc90', 'model x', 'model y', 'hr-v', 'passport', 'atlas', 'tiguan', 'kona', 'venue',
  'trax', 'encore', 'enclave', 'envision', 'escalade', 'xt5', 'xt6', 'navigator', 'aviator', 'nautilus', 'corsair', 'telluride', 'seltos', 'kicks', 'venza', 'c-hr', 'macan', 'cayenne', 'range rover', 'defender', 'discovery', 'r1s'];
const VAN_MODELS = ['odyssey', 'sienna', 'pacifica', 'carnival', 'sedona', 'grand caravan', 'transit', 'sprinter', 'promaster', 'express', 'savana', 'quest', 'town & country'];
const AWD_HINT = ['subaru'];

// Known timing-drive types for popular engines (typical/most common engine for that model & era).
// Each rule: make, model substring, year range, type, note.
const TIMING_RULES = [
  { make: 'honda', model: 'civic', from: 2006, to: 2099, type: 'chain' },
  { make: 'honda', model: 'civic', from: 1990, to: 2005, type: 'belt', interval: 105000 },
  { make: 'honda', model: 'accord', from: 2003, to: 2099, type: 'chain', note: '4-cylinder uses a chain; V6 versions (2003-2017) use a belt (~105k miles).' },
  { make: 'honda', model: 'cr-v', from: 2002, to: 2099, type: 'chain' },
  { make: 'honda', model: 'pilot', from: 2003, to: 2099, type: 'belt', interval: 105000 },
  { make: 'honda', model: 'odyssey', from: 1999, to: 2099, type: 'belt', interval: 105000 },
  { make: 'toyota', model: 'corolla', from: 1998, to: 2099, type: 'chain' },
  { make: 'toyota', model: 'camry', from: 2002, to: 2099, type: 'chain' },
  { make: 'toyota', model: 'rav4', from: 2001, to: 2099, type: 'chain' },
  { make: 'toyota', model: 'tacoma', from: 2005, to: 2099, type: 'chain' },
  { make: 'toyota', model: '4runner', from: 2003, to: 2099, type: 'chain' },
  { make: 'toyota', model: 'prius', from: 2001, to: 2099, type: 'chain' },
  { make: 'ford', model: 'f-150', from: 1997, to: 2099, type: 'chain' },
  { make: 'ford', model: 'mustang', from: 1996, to: 2099, type: 'chain' },
  { make: 'ford', model: 'escape', from: 2013, to: 2099, type: 'chain' },
  { make: 'ford', model: 'explorer', from: 2011, to: 2099, type: 'chain' },
  { make: 'chevrolet', model: 'silverado', from: 1999, to: 2099, type: 'chain' },
  { make: 'chevrolet', model: 'malibu', from: 2008, to: 2099, type: 'chain' },
  { make: 'chevrolet', model: 'cruze', from: 2011, to: 2016, type: 'belt', interval: 100000, note: '1.4L turbo uses a belt (~97-100k miles).' },
  { make: 'nissan', model: 'altima', from: 2002, to: 2099, type: 'chain' },
  { make: 'nissan', model: 'rogue', from: 2008, to: 2099, type: 'chain' },
  { make: 'nissan', model: 'sentra', from: 2007, to: 2099, type: 'chain' },
  { make: 'subaru', model: '', from: 1990, to: 2011, type: 'belt', interval: 105000, note: 'Most Subaru boxer engines before ~2012 use a belt; FB-series engines (2012+) use a chain.' },
  { make: 'subaru', model: '', from: 2012, to: 2099, type: 'chain' },
  { make: 'hyundai', model: '', from: 2011, to: 2099, type: 'chain' },
  { make: 'kia', model: '', from: 2011, to: 2099, type: 'chain' },
  { make: 'mazda', model: '', from: 2012, to: 2099, type: 'chain' },
  { make: 'jeep', model: 'wrangler', from: 2007, to: 2099, type: 'chain' },
  { make: 'volkswagen', model: 'jetta', from: 2015, to: 2099, type: 'chain' },
  { make: 'volkswagen', model: '', from: 1990, to: 2014, type: 'belt', interval: 100000, note: 'Many VW engines of this era use a belt; some 2.0T engines use a chain. Check your engine code.' },
  { make: 'bmw', model: '', from: 1995, to: 2099, type: 'chain' },
  { make: 'mercedes-benz', model: '', from: 1995, to: 2099, type: 'chain' },
];

// Common CVT users (approximate; varies by trim/engine).
const CVT_RULES = [
  { make: 'nissan', model: '', from: 2007 },
  { make: 'subaru', model: '', from: 2010 },
  { make: 'honda', model: 'civic', from: 2016 },
  { make: 'honda', model: 'cr-v', from: 2015 },
  { make: 'honda', model: 'accord', from: 2018 },
  { make: 'honda', model: 'hr-v', from: 2016 },
  { make: 'honda', model: 'fit', from: 2015 },
  { make: 'toyota', model: 'corolla', from: 2014 },
  { make: 'mitsubishi', model: '', from: 2008 },
];

const norm = (s = '') => String(s).toLowerCase().trim();
const hasAny = (str, list) => list.some((w) => {
  const re = new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`, 'i');
  return re.test(str);
});

export function buildProfile(vehicle = {}) {
  const year = Number(vehicle.year) || new Date().getFullYear();
  const make = norm(vehicle.make);
  const model = norm(vehicle.model);
  const vpicType = norm(vehicle.vehicleType); // car | truck | mpv (from vPIC list the model came from)
  const nowYear = new Date().getFullYear();
  const age = Math.max(0, nowYear - year);

  const isEV = EV_MAKES.includes(make) || hasAny(model, EV_MODELS) || norm(vehicle.fuel).includes('electric');
  const isHybrid = !isEV && (hasAny(model, HYBRID_MODELS) || norm(vehicle.fuel).includes('hybrid'));

  let bodyType = 'car';
  if (hasAny(model, TRUCK_MODELS) || vpicType === 'truck') bodyType = 'truck';
  else if (hasAny(model, VAN_MODELS)) bodyType = 'van';
  else if (hasAny(model, SUV_MODELS) || vpicType.includes('mpv') || vpicType.includes('multipurpose')) bodyType = 'suv';

  const isExotic = EXOTIC.includes(make);
  const isLuxury = isExotic || LUXURY.includes(make);
  const isEuropean = EUROPEAN.includes(make);

  let costMultiplier = 1;
  if (isExotic) costMultiplier = 2.4;
  else if (isLuxury) costMultiplier = 1.35;
  else if (isEuropean) costMultiplier = 1.15;
  if (bodyType === 'truck') costMultiplier *= 1.15;
  else if (bodyType === 'suv' || bodyType === 'van') costMultiplier *= 1.08;
  if (isEV) costMultiplier *= 1.1;

  // Oil interval guidance (typical by era)
  let oil;
  if (isEV) oil = null;
  else if (year >= 2011) oil = { miles: 7500, months: 12, range: '5,000-10,000', type: 'Full synthetic (commonly 0W-20, 5W-20 or 5W-30)', note: 'Most cars of this era have an oil-life monitor; follow it, and use the shorter end of the range for short trips, towing, heat, or dust.' };
  else if (year >= 2000) oil = { miles: 5000, months: 6, range: '3,000-7,500', type: 'Synthetic blend or synthetic (commonly 5W-20 or 5W-30)', note: 'Older engines may burn a little oil between changes; check the dipstick monthly.' };
  else oil = { miles: 3000, months: 6, range: '3,000-5,000', type: 'Conventional or high-mileage oil (commonly 10W-30 or 5W-30)', note: 'High-mileage oil can help older seals.' };

  const oilQuarts = isEV ? null : bodyType === 'truck' ? '6-8 qt' : bodyType === 'suv' || bodyType === 'van' ? '5-6 qt' : '4-5 qt';

  // Timing drive
  let timing = { type: 'unknown', note: 'Check whether your engine has a timing belt or chain (owner\'s manual or a parts site using your VIN). Belts usually need replacing around 60k-105k miles; chains usually last the life of the engine.' };
  if (isEV) timing = { type: 'none', note: 'Electric motors have no timing belt or chain.' };
  else {
    const rule = TIMING_RULES.find((r) => r.make === make && (r.model === '' || model.includes(r.model)) && year >= r.from && year <= r.to);
    if (rule) timing = { type: rule.type, interval: rule.interval, note: rule.note || (rule.type === 'chain' ? 'Your engine most likely uses a timing chain, which is designed to last the life of the engine (no scheduled replacement). Listen for rattling at cold start.' : `Your engine most likely uses a timing belt; replace around ${(rule.interval || 100000).toLocaleString()} miles or as your manual says. A snapped belt can destroy the engine.`) };
  }

  const cvt = !isEV && CVT_RULES.some((r) => r.make === make && (r.model === '' || model.includes(r.model)) && year >= r.from);
  const awd = AWD_HINT.includes(make) || bodyType === 'truck' || /awd|4wd|4x4|quattro|xdrive|4matic/i.test(vehicle.model || '');

  const label = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.replace(/\s+/g, ' ').trim();
  const tags = [];
  tags.push(bodyType === 'suv' ? 'SUV / Crossover' : bodyType === 'van' ? 'Minivan / Van' : bodyType === 'truck' ? 'Pickup / Truck' : 'Car');
  if (isEV) tags.push('Electric'); else if (isHybrid) tags.push('Hybrid'); else tags.push('Gas engine');
  if (isLuxury) tags.push(isExotic ? 'Exotic' : 'Luxury');
  if (cvt) tags.push('Likely CVT');
  if (awd) tags.push(bodyType === 'truck' ? 'Often 4x4' : 'AWD likely');
  if (timing.type === 'chain' || timing.type === 'belt') tags.push(`Timing ${timing.type}`);
  tags.push(age <= 3 ? 'Newer vehicle' : age >= 15 ? 'Older vehicle' : `${age} yrs old`);

  return { label, year, make: vehicle.make, model: vehicle.model, age, bodyType, isEV, isHybrid, isLuxury, isExotic, isEuropean,
    costMultiplier: Math.round(costMultiplier * 100) / 100, oil, oilQuarts, timing, cvt, awd, tags };
}
