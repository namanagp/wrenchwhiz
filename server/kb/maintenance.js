// Curated maintenance templates. Intervals are typical industry ranges for the
// vehicle class; the owner's manual for the exact vehicle always wins.

const ITEMS = [
  { id: 'oil', name: 'Engine oil & filter change', icon: '🛢️', category: 'Engine', notEV: true,
    beginner: 'Fresh oil keeps the engine\'s moving parts from grinding against each other. It\'s the single most important routine service.',
    worry: 'Overdue by a few hundred miles is fine. Thousands of miles overdue, or an oil warning light, is not: get it done this week.',
    diy: 'Drain plug + filter. Needs a jack/ramps or low-clearance access, a drain pan, filter wrench and the right oil spec.',
    difficulty: 2, guideId: 'oil-change', priceId: 'oil-change' },
  { id: 'tire-rotation', name: 'Tire rotation & pressure check', icon: '🛞', category: 'Tires',
    miles: 6000, months: 6,
    beginner: 'Moving tires to different corners makes them wear evenly so they last longer. Many shops do it free with an oil change.',
    worry: 'Low risk if skipped once, but uneven wear shortens tire life.',
    diy: 'Jack, jack stands, lug wrench and a torque wrench. Follow the rotation pattern for your drivetrain.',
    difficulty: 2, guideId: 'tire-rotation', priceId: 'tire-rotation' },
  { id: 'wipers', name: 'Wiper blades', icon: '🌧️', category: 'Visibility', miles: 12000, months: 12,
    beginner: 'Replace when they streak, chatter, or leave a haze. Cheap, and you can do it yourself in the parking lot.',
    worry: 'Replace before rainy season; bad wipers are a real visibility hazard.', diy: 'No tools. Match the blade length for driver and passenger sides.',
    difficulty: 1, guideId: 'wiper-blades', priceId: 'wiper-blades' },
  { id: 'engine-air', name: 'Engine air filter', icon: '💨', category: 'Engine', notEV: true, miles: 20000, months: 24,
    beginner: 'Lets the engine breathe clean air. A clogged one can slightly reduce power and mileage.',
    worry: 'Not urgent. Shops often upsell this; check it yourself first, it takes 5 minutes.', diy: 'Usually just clips or a few screws on the airbox.',
    difficulty: 1, guideId: 'engine-air-filter', priceId: 'engine-air-filter' },
  { id: 'cabin-air', name: 'Cabin air filter', icon: '🌬️', category: 'Comfort', miles: 20000, months: 18,
    beginner: 'Filters the air you breathe inside the car. A dirty one causes musty smells and weak A/C airflow.',
    worry: 'Comfort item, not a safety issue.', diy: 'Usually behind the glovebox; no tools or a screwdriver.',
    difficulty: 1, guideId: 'cabin-air-filter', priceId: 'cabin-air-filter' },
  { id: 'brake-inspect', name: 'Brake inspection (pads, rotors, lines)', icon: '🛑', category: 'Brakes', miles: 12000, months: 12,
    beginner: 'A quick look at how much brake pad is left. Pads typically last 30k-70k miles depending on driving.',
    worry: 'Squealing, grinding, a soft pedal, or pulling to one side means get it checked now.', diy: 'Wheel off, measure pad thickness (replace near 3 mm), check rotors for grooves.',
    difficulty: 2, guideId: 'brake-pads', priceId: 'brake-pads-front' },
  { id: 'brake-fluid', name: 'Brake fluid flush', icon: '💧', category: 'Brakes', miles: 30000, months: 36,
    beginner: 'Brake fluid absorbs moisture over time, which can make braking less effective in hard stops.',
    worry: 'Moderate. Do it on schedule, especially in humid climates.', diy: 'Bleeding brakes needs a helper or a vacuum/pressure bleeder and care to avoid air in the lines.',
    difficulty: 3, priceId: 'brake-fluid' },
  { id: 'battery', name: 'Battery test (12V)', icon: '🔋', category: 'Electrical', miles: 12000, months: 12,
    beginner: '12-volt car batteries usually last 3-5 years (less in hot climates like Arizona). Auto parts stores test them free.',
    worry: 'Slow cranking or a battery 4+ years old: test it before it strands you.', diy: 'A multimeter reading ~12.6 V at rest is healthy; ~12.2 V or less is weak.',
    difficulty: 1, guideId: 'battery', priceId: 'battery' },
  { id: 'coolant', name: 'Coolant (antifreeze) replacement', icon: '🌡️', category: 'Engine', miles: 100000, months: 120,
    beginner: 'Coolant keeps the engine from overheating or freezing. Modern long-life coolant lasts many years.',
    worry: 'Check the level monthly. Never open a hot radiator cap.', diy: 'Draining and refilling is doable, but air must be bled from the system. Dispose of old coolant properly; it is toxic to pets.',
    difficulty: 3, guideId: 'coolant-check', priceId: 'coolant-flush' },
  { id: 'spark-plugs', name: 'Spark plugs', icon: '⚡', category: 'Engine', notEV: true, miles: 100000, months: 120,
    beginner: 'They ignite the fuel. Worn plugs cause rough idle, misfires and worse mileage. Modern iridium plugs last ~100k miles.',
    worry: 'A flashing check-engine light means a misfire: reduce driving and get it checked.', diy: 'Easy on many 4-cylinders, much harder on some V6s where rear plugs are buried.',
    difficulty: 3, guideId: 'spark-plugs', priceId: 'spark-plugs' },
  { id: 'trans-fluid', name: 'Transmission fluid service', icon: '⚙️', category: 'Drivetrain', notEV: true, miles: 60000, months: 60,
    beginner: 'Keeps gears shifting smoothly. Some makers say "lifetime" fluid, but many mechanics recommend changing it anyway.',
    worry: 'Slipping, harsh shifts, or burnt-smelling fluid: see a shop soon.', diy: 'Drain-and-fill is possible on many cars; the exact fluid type is critical.',
    difficulty: 3, priceId: 'transmission-fluid' },
  { id: 'serpentine', name: 'Serpentine / drive belt inspection', icon: '🪢', category: 'Engine', notEV: true, miles: 60000, months: 60,
    beginner: 'One rubber belt drives the alternator, A/C and often the water pump. Replace if cracked or squealing.',
    worry: 'A broken belt can cause overheating and a dead battery within minutes.', diy: 'Usually a tensioner and a routing diagram; moderate.',
    difficulty: 3, priceId: 'serpentine-belt' },
  { id: 'tires-replace', name: 'Tire tread check / replacement', icon: '📏', category: 'Tires', miles: 50000, months: 72,
    beginner: 'Do the penny test: put Lincoln\'s head upside-down in the tread. If you can see all of his head, it\'s time for new tires. Replace tires older than ~6 years even if tread looks OK.',
    worry: 'Bald tires are dangerous in rain. Bulges or cords showing: stop driving on that tire.', diy: 'Tire mounting needs shop equipment.',
    difficulty: 5, priceId: 'tires' },
  { id: 'alignment', name: 'Wheel alignment check', icon: '📐', category: 'Tires', miles: 25000, months: 24,
    beginner: 'If the car drifts or the steering wheel is off-center, an alignment prevents fast tire wear.',
    worry: 'Not dangerous by itself, but eats tires.', diy: 'Needs an alignment rack; shop job.', difficulty: 5, priceId: 'alignment' },
];

function dynamicItems(p) {
  const out = [];
  if (p.oil) {
    const oil = ITEMS.find((i) => i.id === 'oil');
    out.push({ ...oil, miles: p.oil.miles, months: p.oil.months, specNote: `${p.oil.type}. Typical interval ${p.oil.range} miles. ${p.oil.note} Typical capacity for this class: ${p.oilQuarts} (confirm in manual).` });
  }
  if (p.timing.type === 'belt') {
    out.push({ id: 'timing-belt', name: 'Timing belt (and usually water pump)', icon: '⏱️', category: 'Engine', miles: p.timing.interval || 100000, months: 96,
      beginner: 'A rubber belt that keeps the engine\'s internals in sync. If it snaps, the engine can be badly damaged. It\'s not optional.',
      worry: 'High. Do not go far past the interval.', diy: 'Advanced job: precise timing marks, special tools. Most DIYers leave this to a shop.',
      difficulty: 5, priceId: 'timing-belt', specNote: p.timing.note });
  } else if (p.timing.type === 'chain') {
    out.push({ id: 'timing-chain', name: 'Timing chain (inspection only)', icon: '⛓️', category: 'Engine', miles: 100000, months: 120,
      beginner: 'Your engine most likely uses a metal timing chain designed to last the engine\'s life. No scheduled replacement; clean oil keeps it healthy.',
      worry: 'Only if you hear rattling at startup or get timing-related check-engine codes.', diy: 'Replacement is an advanced shop job.', difficulty: 5, priceId: 'timing-chain', specNote: p.timing.note });
  } else if (p.timing.type === 'unknown') {
    out.push({ id: 'timing-check', name: 'Find out: timing belt or chain?', icon: '❓', category: 'Engine', miles: 60000, months: 72,
      beginner: 'Some engines have a belt that must be replaced on schedule. It\'s worth confirming which yours has.',
      worry: 'If it\'s a belt and you\'re past ~90k miles with no record of replacement, prioritize it.', diy: 'Look it up with your VIN on a parts site or in the manual.', difficulty: 1, priceId: 'timing-belt', specNote: p.timing.note });
  }
  if (p.cvt) {
    out.push({ id: 'cvt', name: 'CVT fluid change', icon: '🔁', category: 'Drivetrain', miles: 30000, months: 36,
      beginner: 'Your car likely has a CVT (a gearless automatic). CVTs are sensitive to old fluid; changing it on time helps them last.',
      worry: 'Whining, shuddering or slipping: get it checked soon. CVT replacement is expensive.', diy: 'Requires the exact manufacturer fluid and often a temperature-based fill check. Many DIYers let a shop do it.', difficulty: 4, priceId: 'cvt-fluid',
      specNote: 'Typical interval 25k-60k miles depending on manufacturer and severe-use conditions.' });
  }
  if (p.awd) {
    out.push({ id: 'diff', name: p.bodyType === 'truck' ? 'Differential & transfer case fluid' : 'Differential / AWD fluid', icon: '🔩', category: 'Drivetrain', miles: 50000, months: 60,
      beginner: 'Vehicles that send power to all four wheels have extra gearboxes that need their own oil changed occasionally.',
      worry: 'Low urgency, but more often if you tow or go off-road.', diy: 'Fill plug + drain plug; always loosen the fill plug first.', difficulty: 3, priceId: 'diff-fluid' });
  }
  if (p.isEV) {
    out.push({ id: 'ev-battery', name: 'High-voltage battery & thermal system check', icon: '🔌', category: 'EV', miles: 25000, months: 24,
      beginner: 'EVs skip oil changes, but the big battery\'s cooling system and software should be checked at service visits.',
      worry: 'Any high-voltage warning: contact a dealer. Never DIY high-voltage parts.', diy: 'Not a DIY item. Orange cables = high voltage.', difficulty: 5, priceId: 'ev-inspection' });
    out.push({ id: 'ev-coolant', name: 'Battery coolant service', icon: '❄️', category: 'EV', miles: 100000, months: 96,
      beginner: 'Many EVs use liquid coolant for the battery. Some makers say it lasts very long; follow your manual.', worry: 'Low.', diy: 'Dealer recommended.', difficulty: 5, priceId: 'coolant-flush' });
  }
  if (p.isHybrid) {
    out.push({ id: 'hybrid-inverter', name: 'Hybrid inverter coolant & battery fan filter', icon: '🔋', category: 'Hybrid', miles: 100000, months: 120,
      beginner: 'Hybrids have extra cooling for the hybrid battery and electronics. Some have a small battery-cooling fan filter under the rear seat to clean.',
      worry: 'A hybrid system warning means get it checked.', diy: 'Fan filter cleaning is easy on many hybrids; inverter coolant is moderate.', difficulty: 2, priceId: 'coolant-flush' });
  }
  return out;
}

export function buildSchedule(profile, currentMileage = 0, mode = 'beginner') {
  let items = [...dynamicItems(profile), ...ITEMS.filter((i) => i.id !== 'oil' && !(i.notEV && profile.isEV))];
  if (profile.isEV) {
    items = items.map((i) => (i.id === 'brake-inspect' ? { ...i, specNote: 'EVs use regenerative braking, so pads often last much longer, but calipers can corrode from lack of use. Keep inspecting yearly.' } : i));
    items = items.map((i) => (i.id === 'tire-rotation' ? { ...i, miles: 6000, specNote: 'EVs are heavy and torquey, so tires can wear faster; rotate every 5k-7.5k miles.' } : i));
  }
  if (profile.bodyType === 'truck') {
    items = items.map((i) => (i.id === 'brake-inspect' ? { ...i, specNote: 'Towing and hauling wear brakes faster; inspect more often if you tow.' } : i));
  }
  if (profile.age >= 15) {
    items.push({ id: 'old-car', name: 'Rubber parts & hoses inspection', icon: '🧰', category: 'Aging vehicle', miles: 12000, months: 12,
      beginner: 'On older cars, rubber hoses, bushings and seals dry out. A yearly look prevents surprise leaks and breakdowns.',
      worry: 'Coolant drips or swollen hoses: fix soon.', diy: 'Visual check with a flashlight; squeeze hoses when cool.', difficulty: 1 });
  }
  items.sort((a, b) => a.miles - b.miles);

  const mileage = Math.max(0, Number(currentMileage) || 0);
  const withStatus = items.map((i) => {
    const nextDue = mileage === 0 ? i.miles : Math.ceil((mileage + 1) / i.miles) * i.miles;
    const milesUntil = nextDue - mileage;
    let status = 'ok';
    if (mileage > 0) {
      if (milesUntil <= Math.min(1000, i.miles * 0.15)) status = 'due';
      else if (milesUntil <= i.miles * 0.3) status = 'soon';
    }
    const base = { id: i.id, name: i.name, icon: i.icon, category: i.category, intervalMiles: i.miles, intervalMonths: i.months,
      nextDue, milesUntil, status, difficulty: i.difficulty, guideId: i.guideId, priceId: i.priceId, specNote: i.specNote };
    return mode === 'diy' ? { ...base, detail: i.diy, worry: i.worry } : { ...base, detail: i.beginner, worry: i.worry };
  });

  // Milestone timeline (what happens at each major visit)
  const marks = [5000, 15000, 30000, 60000, 90000, 100000, 120000, 150000];
  const milestones = marks.map((m, idx) => {
    const prev = idx === 0 ? 0 : marks[idx - 1];
    return { miles: m, items: items.filter((i) => Math.floor(m / i.miles) > Math.floor(prev / i.miles)).map((i) => i.name) };
  });

  return { items: withStatus, milestones, currentMileage: mileage,
    notes: [
      'Intervals are typical for this type of vehicle, not copied from your owner\'s manual. Your manual (or the car\'s maintenance minder) is the final word.',
      'Use "severe service" (shorter) intervals if you mostly do short trips, tow, drive in extreme heat or dust, or sit in stop-and-go traffic.',
    ] };
}
