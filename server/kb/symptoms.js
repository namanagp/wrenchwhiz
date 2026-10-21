// Common symptom -> likely-cause map. Weights are rough relative likelihoods
// for a typical vehicle, used only to rank causes.
// urgency: 'safe' (OK to drive, schedule it) | 'soon' (fix within days) | 'stop' (stop driving / tow)

export const SYMPTOMS = [
  { id: 'brake-squeal', title: 'Squealing or squeaking when braking', urgency: 'soon',
    keywords: ['squeal', 'squeak', 'squeaking', 'squealing', 'screech', 'brake noise', 'high pitch', 'high-pitched'],
    requireAny: ['brake', 'braking', 'stop', 'stopping', 'pedal', 'squeal', 'squeak'],
    causes: [
      { name: 'Brake pads worn down to the wear indicator', weight: 5, diy: true, priceId: 'brake-pads-front', guideId: 'brake-pads', why: 'A small metal tab on the pad is designed to squeal when the pad is nearly worn out.' },
      { name: 'Glazed pads or rotors / brake dust', weight: 3, diy: true, priceId: 'brake-pads-rotors', why: 'Hard, shiny pads or rotors can squeal, especially in the morning or after heavy braking.' },
      { name: 'Missing anti-squeal shims or lubricant', weight: 2, diy: true, priceId: 'brake-pads-front', why: 'Common after a cheap brake job.' },
      { name: 'Morning moisture / surface rust (harmless)', weight: 2, diy: true, why: 'A brief squeal for the first few stops after rain or overnight is normal.' },
    ],
    beginner: 'Brakes that squeal usually mean the pads are getting thin. It\'s not an emergency yet, but don\'t wait more than a week or two, or it can turn into grinding (more expensive).',
    checks: ['Look through the wheel spokes at the brake pad: less than ~3 mm (1/8") of material means replace.', 'Note whether it happens only in the morning/after rain (often harmless).'] },
  { id: 'brake-grind', title: 'Grinding when braking', urgency: 'stop',
    keywords: ['grind', 'grinding', 'metal on metal', 'scraping', 'scrape'],
    requireAny: ['brake', 'braking', 'stop', 'stopping', 'pedal', 'grind', 'grinding'],
    causes: [
      { name: 'Brake pads completely worn; metal backing on rotor', weight: 6, diy: true, priceId: 'brake-pads-rotors', guideId: 'brake-pads', why: 'Once the pad material is gone, steel grinds against the rotor and braking power drops.' },
      { name: 'Rock or debris stuck in the brake', weight: 2, diy: true, why: 'Can make a grinding/scraping sound that comes and goes.' },
      { name: 'Seized caliper or failed wheel bearing', weight: 2, diy: false, priceId: 'wheel-bearing', why: 'Grinding that continues when not braking can be a bearing.' },
    ],
    beginner: 'Grinding brakes usually mean the pads are worn through and metal is hitting metal. Your stopping power is reduced. Avoid driving except slowly to a shop, or have it towed.',
    checks: ['Does it grind only when braking (pads) or all the time (bearing/debris)?', 'Is the brake pedal lower or softer than normal? If yes, do not drive.'] },
  { id: 'soft-pedal', title: 'Soft, spongy or sinking brake pedal', urgency: 'stop',
    keywords: ['spongy', 'soft pedal', 'soft brake', 'pedal sinks', 'pedal goes to the floor', 'sinking', 'mushy'],
    causes: [
      { name: 'Air or moisture in brake lines', weight: 4, diy: true, priceId: 'brake-fluid', why: 'Air compresses, making the pedal feel soft.' },
      { name: 'Brake fluid leak', weight: 4, diy: false, priceId: 'brake-fluid', why: 'Check for wet spots near the wheels and low fluid in the reservoir.' },
      { name: 'Failing brake master cylinder', weight: 3, diy: false, why: 'Pedal slowly sinks while holding steady pressure at a stop.' },
    ],
    beginner: 'A soft or sinking brake pedal means your brakes may not stop the car. Don\'t drive it. Have it towed to a shop.',
    checks: ['Check the brake fluid reservoir level under the hood (MIN/MAX lines).', 'Look for wet, oily spots behind the wheels.'] },
  { id: 'wont-start-click', title: 'Car won\'t start / clicking when turning the key', urgency: 'soon',
    keywords: ['won\'t start', 'wont start', 'doesn\'t start', 'no start', 'clicking', 'click', 'dead battery', 'slow crank', 'cranks slowly', 'not starting', 'won\'t turn over', 'dead'],
    causes: [
      { name: 'Weak or dead 12V battery', weight: 6, diy: true, priceId: 'battery', guideId: 'battery', why: 'Rapid clicking + dim dash lights is the classic sign. Batteries last ~3-5 years (less in heat).' },
      { name: 'Corroded or loose battery terminals', weight: 3, diy: true, guideId: 'battery', why: 'White/green crust on terminals blocks current.' },
      { name: 'Failing starter motor', weight: 2, diy: true, priceId: 'starter', why: 'A single loud click with bright dash lights points to the starter.' },
      { name: 'Alternator not charging', weight: 2, diy: true, priceId: 'alternator', why: 'If the battery keeps dying after a jump, the alternator may not be recharging it.' },
    ],
    beginner: 'This is usually the battery. Try a jump start. If it starts, drive to an auto parts store; most test batteries and charging systems for free.',
    checks: ['Do the dashboard lights come on bright, dim, or not at all?', 'Rapid clicking = battery; one click = starter; cranks but won\'t fire = fuel/spark.'] },
  { id: 'cranks-no-start', title: 'Engine cranks but won\'t start', urgency: 'soon', notEV: true,
    keywords: ['cranks but', 'turns over but', 'cranks no start', 'won\'t fire', 'cranking'],
    causes: [
      { name: 'Fuel delivery problem (pump, relay, empty tank)', weight: 4, diy: false, priceId: 'fuel-pump', why: 'Listen for a 2-second hum from the fuel tank when you turn the key to ON.' },
      { name: 'Ignition problem (coil, plugs, crank sensor)', weight: 3, diy: true, priceId: 'diagnostic', why: 'No spark = no combustion.' },
      { name: 'Immobilizer/key not recognized', weight: 2, diy: true, why: 'A flashing security/key light on the dash. Try the spare key.' },
    ],
    beginner: 'The battery is probably OK since the engine spins. Check that you have fuel, try your spare key, and if that fails, it needs diagnosis.',
    checks: ['Is there a security/key light flashing?', 'Did the check-engine light come on recently?'] },
  { id: 'check-engine', title: 'Check-engine light is on', urgency: 'soon', notEV: true,
    keywords: ['check engine', 'cel', 'engine light', 'mil light', 'warning light', 'engine symbol', 'p0'],
    causes: [
      { name: 'Loose or faulty gas cap (evap leak)', weight: 3, diy: true, why: 'The cheapest fix. Tighten until it clicks and drive a few days.' },
      { name: 'Oxygen (O2) sensor', weight: 3, diy: true, priceId: 'o2-sensor', why: 'Common on older cars; hurts fuel economy.' },
      { name: 'Ignition coil or spark plug misfire', weight: 3, diy: true, priceId: 'ignition-coil', guideId: 'spark-plugs', why: 'Rough idle or shaking often comes with it.' },
      { name: 'Catalytic converter efficiency', weight: 2, diy: false, priceId: 'catalytic-converter', why: 'Codes like P0420; often caused by another problem upstream.' },
    ],
    beginner: 'A steady check-engine light means "get it looked at soon", not an emergency. A FLASHING light means a serious misfire: slow down and avoid driving. Many auto parts stores will read the code for free.',
    checks: ['Is the light steady or flashing?', 'Get the code read (OBD-II scanner, ~$25, or free at many parts stores).'] },
  { id: 'overheat', title: 'Overheating / temperature gauge high / steam', urgency: 'stop', notEV: true,
    keywords: ['overheat', 'overheating', 'temperature high', 'temp gauge', 'running hot', 'steam', 'smoke from hood', 'coolant light', 'hot engine'],
    causes: [
      { name: 'Low coolant from a leak (hose, radiator, water pump)', weight: 5, diy: true, priceId: 'radiator', guideId: 'coolant-check', why: 'Look for puddles that are green, orange or pink and smell sweet.' },
      { name: 'Stuck thermostat', weight: 3, diy: true, priceId: 'thermostat', why: 'Blocks coolant flow to the radiator.' },
      { name: 'Radiator fan not working', weight: 3, diy: false, why: 'Overheats in traffic but OK on the highway.' },
      { name: 'Failing water pump', weight: 2, diy: false, priceId: 'water-pump', why: 'Leak or wobble from the pump pulley.' },
    ],
    beginner: 'Pull over safely and turn off the engine. Driving an overheating engine can destroy it within minutes. NEVER open the radiator cap while hot; pressurized coolant can burn you.',
    checks: ['Let it cool 30+ minutes, then check the coolant reservoir level.', 'Turn the heater on full hot as an emergency measure; it pulls heat from the engine.'] },
  { id: 'vibration-highway', title: 'Steering wheel shakes at highway speed', urgency: 'safe',
    keywords: ['shake', 'shaking', 'vibration', 'vibrate', 'wobble', 'steering wheel shakes', 'shimmy'],
    causes: [
      { name: 'Wheel out of balance (lost a wheel weight)', weight: 5, penalizeIf: 'brak|stopping', diy: false, priceId: 'tire-balance', why: 'Classic vibration at 55-70 mph that smooths out above/below.' },
      { name: 'Warped / uneven brake rotors (if it shakes when braking)', weight: 4, boostIf: 'brak|stopping', diy: true, priceId: 'brake-pads-rotors', guideId: 'brake-pads', why: 'Pulsing brake pedal + shaking wheel while braking.' },
      { name: 'Damaged tire (bulge, separated belt)', weight: 3, diy: false, priceId: 'tire-single', why: 'Check tires for bulges, a dangerous condition.' },
      { name: 'Worn suspension or steering parts', weight: 2, diy: false, priceId: 'tie-rod', why: 'Clunks over bumps and loose steering point here.' },
    ],
    beginner: 'Most often the tires just need balancing (cheap). If it only shakes when you brake, it\'s the brake rotors. If you see a bulge on a tire, replace it before driving more.',
    checks: ['Does it shake only while braking, or while cruising?', 'Inspect each tire sidewall for bulges.'] },
  { id: 'pulls', title: 'Car pulls to one side', urgency: 'safe',
    keywords: ['pulls', 'pulling', 'drifts', 'drifting', 'pull to the left', 'pull to the right', 'crooked steering', 'off center'],
    causes: [
      { name: 'Uneven tire pressure', weight: 5, diy: true, guideId: 'tire-rotation', why: 'Check all four tires against the sticker in the driver\'s door jamb.' },
      { name: 'Wheel alignment out of spec', weight: 4, diy: false, priceId: 'alignment', why: 'Potholes and curbs knock alignment out.' },
      { name: 'Sticking brake caliper (if wheel is hot / burning smell)', weight: 2, diy: true, why: 'One brake dragging pulls the car to that side.' },
    ],
    beginner: 'Start by checking tire pressure; that fixes it more often than you\'d think. If it still pulls, get an alignment.',
    checks: ['Check pressures with a gauge when tires are cold.', 'After a drive, carefully feel near each wheel: one much hotter than others = dragging brake.'] },
  { id: 'rough-idle', title: 'Rough idle, shaking at stops, or misfiring', urgency: 'soon', notEV: true,
    keywords: ['rough idle', 'idle rough', 'misfire', 'sputter', 'sputtering', 'stalls', 'stalling', 'hesitation', 'hesitates', 'shakes at idle', 'jerks'],
    causes: [
      { name: 'Worn spark plugs', weight: 4, diy: true, priceId: 'spark-plugs', guideId: 'spark-plugs', why: 'Especially past ~100k miles.' },
      { name: 'Failing ignition coil', weight: 4, diy: true, priceId: 'ignition-coil', why: 'Often sets a P030X misfire code.' },
      { name: 'Vacuum leak', weight: 2, diy: true, priceId: 'diagnostic', why: 'Hissing sound at idle; cracked hoses.' },
      { name: 'Dirty throttle body / fuel injectors', weight: 2, diy: true, why: 'Idle fluctuates or engine stumbles.' },
    ],
    beginner: 'The engine isn\'t burning fuel evenly. Get the codes read. If the check-engine light is flashing, avoid driving; it can damage the catalytic converter.',
    checks: ['Is the check-engine light on/flashing?', 'Does it happen cold, warm, or always?'] },
  { id: 'squeal-engine', title: 'Squealing from the engine (not brakes)', urgency: 'soon', notEV: true,
    keywords: ['belt squeal', 'squeal on startup', 'squeals when starting', 'squealing engine', 'chirp', 'chirping', 'squeal when turning'],
    causes: [
      { name: 'Worn or loose serpentine belt', weight: 5, diy: true, priceId: 'serpentine-belt', why: 'Squeals on cold starts or when the A/C turns on.' },
      { name: 'Weak belt tensioner or idler pulley', weight: 3, diy: true, priceId: 'serpentine-belt', why: 'Chirping that changes with RPM.' },
    ],
    beginner: 'Usually the main drive belt. Not an emergency, but if it breaks you\'ll lose charging and possibly cooling. Get it replaced soon.',
    checks: ['With the engine OFF, look at the belt for cracks or shiny glazing.'] },
  { id: 'clunk', title: 'Clunking or knocking over bumps', urgency: 'soon',
    keywords: ['clunk', 'clunking', 'knock over bumps', 'rattle over bumps', 'bumps', 'thud', 'suspension noise', 'popping when turning'],
    causes: [
      { name: 'Worn sway bar links', weight: 4, diy: true, priceId: 'struts', why: 'Most common clunk; inexpensive part.' },
      { name: 'Worn struts / shocks or mounts', weight: 3, diy: true, priceId: 'struts', why: 'Bouncy ride, nose-dives when braking.' },
      { name: 'Worn CV axle (clicking when turning)', weight: 3, diy: true, priceId: 'cv-axle', why: 'Clicking during tight turns = outer CV joint.' },
      { name: 'Loose/worn ball joint or tie rod', weight: 2, diy: false, priceId: 'tie-rod', why: 'Safety-critical steering components.' },
    ],
    beginner: 'Something in the suspension is worn. Usually not an emergency, but a shop should look within a couple of weeks because some of these parts affect steering.',
    checks: ['Does it happen over bumps (suspension) or when turning sharply (CV axle)?'] },
  { id: 'battery-light', title: 'Battery / charging light on, dim lights', urgency: 'soon',
    keywords: ['battery light', 'charging light', 'alternator', 'dim lights', 'dim headlights', 'flickering lights', 'electrical'],
    causes: [
      { name: 'Failing alternator', weight: 5, diy: true, priceId: 'alternator', why: 'The car runs on battery alone and will die soon.' },
      { name: 'Broken or slipping serpentine belt', weight: 3, diy: true, priceId: 'serpentine-belt', why: 'The belt spins the alternator.' },
      { name: 'Bad battery or corroded cables', weight: 2, diy: true, priceId: 'battery', guideId: 'battery', why: 'Can trigger the light too.' },
    ],
    beginner: 'Your car may be running on battery power only. Turn off accessories (A/C, radio) and drive directly to a shop or parts store. You may have 20-60 minutes before it dies.',
    checks: ['With the engine running, a multimeter on the battery should read ~13.8-14.7 V.'] },
  { id: 'smell-burning', title: 'Burning smell', urgency: 'soon',
    keywords: ['burning smell', 'smells like burning', 'burnt smell', 'burning oil', 'smell', 'smoke', 'burning rubber', 'sweet smell', 'rotten egg'],
    causes: [
      { name: 'Oil leaking onto hot exhaust', weight: 4, diy: true, priceId: 'diagnostic', why: 'Burnt-oil smell, light smoke from under hood. Often a valve cover gasket.' },
      { name: 'Coolant leak (sweet, syrupy smell)', weight: 3, diy: true, priceId: 'radiator', guideId: 'coolant-check', why: 'Watch the temperature gauge.' },
      { name: 'Dragging brake or slipping clutch (hot, acrid)', weight: 2, diy: false, why: 'Check if one wheel is much hotter.' },
      { name: 'Catalytic converter / rich running (rotten eggs)', weight: 2, diy: false, priceId: 'catalytic-converter', why: 'Sulfur smell.' },
    ],
    beginner: 'If you see smoke or flames, pull over, turn off the car, and get away from it. A smell without smoke is usually a leak that should be checked within a few days.',
    checks: ['Describe the smell: burnt oil, sweet syrup, hot plastic, rotten eggs?', 'Look under the car for fresh drips.'] },
  { id: 'leak', title: 'Fluid leaking under the car', urgency: 'soon',
    keywords: ['leak', 'leaking', 'puddle', 'drip', 'dripping', 'fluid under'],
    causes: [
      { name: 'Clear water under the front passenger side (A/C condensation)', weight: 4, diy: true, why: 'Totally normal on hot days.' },
      { name: 'Brown/black oil: engine oil leak', weight: 4, diy: true, priceId: 'diagnostic', why: 'Check oil level; common at oil pan, filter or valve cover.' },
      { name: 'Green/orange/pink and sweet: coolant', weight: 3, diy: true, priceId: 'radiator', guideId: 'coolant-check', why: 'Toxic to pets; fix soon.' },
      { name: 'Red/pink and oily: transmission or power steering fluid', weight: 2, diy: false, priceId: 'transmission-fluid', why: 'Low transmission fluid can damage the transmission.' },
      { name: 'Clear-to-yellow, slippery, near a wheel: brake fluid', weight: 1, diy: false, priceId: 'brake-fluid', why: 'Brake fluid leaks are a safety issue: don\'t drive.' },
    ],
    beginner: 'Put a piece of white cardboard under the car overnight; the color tells you a lot. Clear water is usually just A/C condensation and harmless.',
    checks: ['Note the color, smell and location (front/middle/rear, which side).'] },
  { id: 'ac-weak', title: 'A/C blows warm or weak', urgency: 'safe',
    keywords: ['a/c', 'ac not cold', 'air conditioning', 'blowing warm', 'blows warm', 'not cold', 'weak airflow', 'ac', 'air conditioner'],
    causes: [
      { name: 'Low refrigerant (small leak)', weight: 5, diy: false, priceId: 'ac-recharge', why: 'A/C systems are sealed; low refrigerant means a leak somewhere.' },
      { name: 'Clogged cabin air filter (weak airflow)', weight: 3, diy: true, priceId: 'cabin-air-filter', guideId: 'cabin-air-filter', why: 'Cheap and easy first thing to check.' },
      { name: 'A/C compressor clutch or relay failure', weight: 2, diy: false, why: 'Compressor doesn\'t click on.' },
    ],
    beginner: 'Annoying but not dangerous (unless extreme heat is a health risk for you). Check the cabin air filter first. DIY recharge cans exist, but overfilling can damage the system.',
    checks: ['Is airflow weak (filter/blower) or is the air just not cold (refrigerant/compressor)?'] },
  { id: 'trans-slip', title: 'Transmission slipping, harsh or delayed shifts', urgency: 'soon', notEV: true,
    keywords: ['slipping', 'slips', 'harsh shift', 'hard shift', 'delayed shift', 'transmission', 'rpm jumps', 'won\'t shift', 'jerky shift', 'whine', 'whining', 'shudder', 'shuddering'],
    causes: [
      { name: 'Low or worn-out transmission fluid', weight: 4, diy: true, priceId: 'transmission-fluid', why: 'Check level/color if your car has a dipstick: red = good, brown/burnt = old.' },
      { name: 'Transmission software or solenoid issue', weight: 3, diy: false, priceId: 'diagnostic', why: 'Many shifting complaints are fixed with updates. Check recalls/TSBs.' },
      { name: 'Internal wear (clutches, torque converter, CVT belt)', weight: 2, diy: false, why: 'Expensive; get a proper diagnosis before agreeing to a replacement.' },
    ],
    beginner: 'Get it checked soon. Transmission problems get expensive if ignored. Ask for a diagnosis and check this car\'s recalls first; some are covered for free.',
    checks: ['Does the RPM rise without the car speeding up (slipping)?', 'Check the Recalls tab for transmission-related recalls.'] },
  { id: 'tpms', title: 'Tire pressure light on', urgency: 'safe',
    keywords: ['tire pressure', 'tpms', 'low tire', 'flat', 'flat tire', 'tire light', 'losing air'],
    causes: [
      { name: 'Cold weather dropped the pressure', weight: 4, diy: true, why: 'Pressure drops ~1 psi per 10°F.' },
      { name: 'Slow leak (nail, valve stem)', weight: 4, diy: true, priceId: 'tire-repair', why: 'Plug/patch repair is usually $20-40.' },
      { name: 'Failed TPMS sensor battery (light flashes then stays on)', weight: 2, diy: false, why: 'Sensors last ~7-10 years.' },
    ],
    beginner: 'Check all four tires (and the spare) with a gauge and fill to the number on the driver\'s door jamb sticker, not the number on the tire.',
    checks: ['Does one tire look visibly low? Check for nails.'] },
];

const tokenize = (t) => ` ${String(t).toLowerCase().replace(/[^a-z0-9/' -]/g, ' ').replace(/\s+/g, ' ')} `;

export function matchSymptoms(text, profile) {
  const q = tokenize(text);
  const scored = SYMPTOMS.filter((s) => !(s.notEV && profile?.isEV)).map((s) => {
    let score = 0;
    for (const k of s.keywords) if (q.includes(` ${k} `) || (k.length > 4 && q.includes(k))) score += k.includes(' ') ? 3 : 2;
    if (s.requireAny && !s.requireAny.some((w) => q.includes(w))) score = 0;
    // Brake-related squeal vs engine squeal disambiguation
    if (s.id === 'brake-squeal' && /(engine|belt|start|turning the wheel|hood)/.test(q) && !/brak/.test(q)) score = 0;
    if (s.id === 'squeal-engine' && /brak/.test(q)) score = 0;
    if (s.id === 'vibration-highway' && score > 0 && /brak/.test(q)) score += 1;
    if (score > 0) score += s.urgency === 'stop' ? 2 : s.urgency === 'soon' ? 1 : 0;
    return { s, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.s);
}
