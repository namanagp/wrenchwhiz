// Typical U.S. price ranges (parts in USD, labor in "book" hours). These are
// broad estimates for a mainstream vehicle and are scaled by the vehicle
// profile's cost multiplier. They are NOT quotes.

export const DEFAULT_LABOR_RATE = { low: 110, high: 180 }; // typical independent-to-dealer hourly range

export const JOBS = {
  'oil-change': { name: 'Oil & filter change (synthetic)', parts: [35, 70], hours: [0.3, 0.5], diyTools: 'Wrench, drain pan, filter wrench, funnel (~$40 one-time)' },
  'tire-rotation': { name: 'Tire rotation', parts: [0, 0], hours: [0.3, 0.5], diyTools: 'Jack + 2 jack stands + torque wrench (~$120 one-time)' },
  'wiper-blades': { name: 'Wiper blades (pair)', parts: [20, 55], hours: [0.1, 0.2], diyTools: 'None' },
  'engine-air-filter': { name: 'Engine air filter', parts: [15, 40], hours: [0.1, 0.3], diyTools: 'Screwdriver (maybe)' },
  'cabin-air-filter': { name: 'Cabin air filter', parts: [15, 40], hours: [0.1, 0.4], diyTools: 'None or screwdriver' },
  'brake-pads-front': { name: 'Front brake pads', parts: [40, 110], hours: [1.0, 1.5], diyTools: 'Jack, stands, socket set, C-clamp/caliper tool, torque wrench' },
  'brake-pads-rotors': { name: 'Front brake pads + rotors', parts: [120, 300], hours: [1.3, 2.0], diyTools: 'Same as pads; possibly impact driver for rotor screws' },
  'brake-fluid': { name: 'Brake fluid flush', parts: [10, 25], hours: [0.8, 1.2], diyTools: 'Bleeder kit, wrench, helper (~$25)' },
  'battery': { name: '12V battery replacement', parts: [130, 260], hours: [0.3, 0.7], diyTools: '10 mm wrench / socket set' },
  'coolant-flush': { name: 'Coolant drain & refill', parts: [30, 70], hours: [1.0, 1.5], diyTools: 'Drain pan, funnel (spill-free funnel helps)' },
  'spark-plugs': { name: 'Spark plugs (4-cyl; V6 costs more)', parts: [40, 110], hours: [0.8, 2.5], diyTools: 'Spark plug socket, extensions, torque wrench' },
  'transmission-fluid': { name: 'Automatic transmission fluid service', parts: [50, 130], hours: [0.8, 1.5], diyTools: 'Drain pan, fluid pump' },
  'cvt-fluid': { name: 'CVT fluid change', parts: [60, 150], hours: [0.8, 1.3], diyTools: 'Fluid pump; a scan tool for temperature check' },
  'serpentine-belt': { name: 'Serpentine belt', parts: [25, 75], hours: [0.4, 1.0], diyTools: 'Long breaker bar / serpentine belt tool' },
  'timing-belt': { name: 'Timing belt + water pump kit', parts: [150, 400], hours: [3.5, 6.0], diyTools: 'Advanced: cam locks, crank pulley holder, torque wrench' },
  'timing-chain': { name: 'Timing chain replacement (if it fails)', parts: [200, 600], hours: [6, 12], diyTools: 'Shop job' },
  'tires': { name: 'Set of 4 tires, mounted & balanced', parts: [500, 1100], hours: [1.0, 1.5], diyTools: 'Shop job (mounting machine)' },
  'tire-balance': { name: 'Wheel balance (all 4)', parts: [0, 10], hours: [0.5, 1.0], diyTools: 'Shop job (balancing machine)' },
  'tire-single': { name: 'Replace one tire (mounted & balanced)', parts: [120, 280], hours: [0.4, 0.6], diyTools: 'Shop job (mounting machine)' },
  'tire-repair': { name: 'Flat tire plug/patch repair', parts: [5, 15], hours: [0.2, 0.4], diyTools: 'Plug kit (~$15) works for tread punctures; patches need a shop' },
  'alignment': { name: 'Wheel alignment', parts: [0, 0], hours: [0.8, 1.0], diyTools: 'Shop job' },
  'diff-fluid': { name: 'Differential / transfer case fluid', parts: [30, 90], hours: [0.5, 1.2], diyTools: 'Socket/hex set, fluid pump' },
  'alternator': { name: 'Alternator replacement', parts: [180, 450], hours: [1.0, 2.5], diyTools: 'Socket set, belt tool' },
  'starter': { name: 'Starter motor replacement', parts: [150, 400], hours: [1.0, 2.5], diyTools: 'Socket set, extensions' },
  'o2-sensor': { name: 'Oxygen (O2) sensor', parts: [40, 150], hours: [0.3, 1.0], diyTools: 'O2 sensor socket, penetrating oil' },
  'ignition-coil': { name: 'Ignition coil (one)', parts: [40, 120], hours: [0.3, 1.0], diyTools: 'Socket set' },
  'catalytic-converter': { name: 'Catalytic converter', parts: [400, 2000], hours: [1.0, 2.5], diyTools: 'Shop job usually' },
  'wheel-bearing': { name: 'Wheel bearing / hub assembly (one)', parts: [80, 250], hours: [1.0, 2.0], diyTools: 'Large socket, breaker bar, sometimes a press' },
  'struts': { name: 'Front struts (pair)', parts: [200, 500], hours: [2.0, 3.5], diyTools: 'Complete strut assemblies avoid needing a spring compressor' },
  'cv-axle': { name: 'CV axle (one)', parts: [80, 220], hours: [1.0, 2.0], diyTools: 'Axle nut socket, breaker bar, pry bar' },
  'water-pump': { name: 'Water pump', parts: [60, 250], hours: [1.5, 4.0], diyTools: 'Varies a lot; belt-driven ones are easier' },
  'radiator': { name: 'Radiator replacement', parts: [120, 350], hours: [1.5, 3.0], diyTools: 'Socket set, drain pan' },
  'thermostat': { name: 'Thermostat', parts: [20, 70], hours: [0.8, 1.5], diyTools: 'Socket set, drain pan' },
  'ac-recharge': { name: 'A/C recharge (evacuate & recharge)', parts: [40, 150], hours: [0.8, 1.2], diyTools: 'Shop recommended (refrigerant handling rules)' },
  'headlight-bulb': { name: 'Headlight bulb (halogen)', parts: [15, 40], hours: [0.2, 0.6], diyTools: 'Usually none' },
  'diagnostic': { name: 'Diagnostic / check-engine scan', parts: [0, 0], hours: [0.5, 1.0], diyTools: 'OBD-II scanner (~$25-60), many parts stores read codes free' },
  'ev-inspection': { name: 'EV inspection (battery cooling, brakes, cabin filter)', parts: [20, 60], hours: [0.8, 1.2], diyTools: 'Dealer / EV specialist' },
  'fuel-pump': { name: 'Fuel pump', parts: [150, 450], hours: [1.5, 3.5], diyTools: 'Often requires dropping the fuel tank' },
  'exhaust-leak': { name: 'Exhaust leak repair', parts: [30, 250], hours: [0.5, 2.0], diyTools: 'Shop usually (welding / rusty bolts)' },
  'tie-rod': { name: 'Outer tie rod end + alignment', parts: [30, 90], hours: [1.0, 1.5], diyTools: 'Tie rod separator; alignment required after' },
};

const round5 = (n) => Math.round(n / 5) * 5;

export function estimate(jobId, profile, laborRate = DEFAULT_LABOR_RATE) {
  const job = JOBS[jobId];
  if (!job) return null;
  const m = profile?.costMultiplier || 1;
  const partsLow = round5(job.parts[0] * m);
  const partsHigh = round5(job.parts[1] * m);
  const laborLow = round5(job.hours[0] * laborRate.low * (m > 1.3 ? 1.1 : 1));
  const laborHigh = round5(job.hours[1] * laborRate.high * (m > 1.3 ? 1.15 : 1));
  // Shops mark parts up ~20-50%
  const shopLow = round5(partsLow * 1.2 + laborLow);
  const shopHigh = round5(partsHigh * 1.5 + laborHigh);
  return {
    id: jobId, name: job.name,
    diy: { low: partsLow, high: partsHigh, tools: job.diyTools },
    shop: { low: Math.max(shopLow, 20), high: Math.max(shopHigh, 40), laborHours: job.hours },
    redFlag: round5(shopHigh * 1.35),
  };
}

export function allEstimates(profile, laborRate) {
  return Object.keys(JOBS).map((id) => estimate(id, profile, laborRate)).filter(Boolean)
    .filter((e) => !(profile.isEV && ['oil-change', 'spark-plugs', 'engine-air-filter', 'transmission-fluid', 'timing-belt', 'timing-chain', 'o2-sensor', 'ignition-coil', 'catalytic-converter', 'fuel-pump', 'exhaust-leak', 'serpentine-belt', 'cvt-fluid'].includes(e.id)));
}

export const PRICE_DISCLAIMER = 'Estimates only, based on typical U.S. parts prices and shop labor rates ($110-$180/hr by default), scaled for this vehicle class. Not a quote. Prices vary by region, shop, part brand and your exact trim/engine.';
