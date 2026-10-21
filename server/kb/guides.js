// Curated step-by-step guides. Generic procedures adapted to the vehicle profile.
// Specific torque values/capacities are given as typical ranges only, always
// with a reminder to confirm the exact spec for the vehicle.

const lugTorque = (p) => (p.bodyType === 'truck' ? '~140-165 ft-lb is typical for half-ton trucks' : p.bodyType === 'suv' || p.bodyType === 'van' ? '~80-110 ft-lb is typical for SUVs/minivans' : '~76-100 ft-lb is typical for cars');
const liftNote = (p) => (p.bodyType === 'truck' ? 'Trucks usually have enough clearance to reach the drain plug without lifting; if you do lift, use stands rated for the truck\'s weight (3-ton+).' : 'Use ramps or a jack on the factory lift points, then support the car with jack stands.');

const GUIDES = [
  { id: 'oil-change', title: 'Change the engine oil & filter', icon: '🛢️', difficulty: 2, time: '30-60 min', notEV: true, priceId: 'oil-change',
    summary: 'Drain old oil, swap the filter, refill with the correct oil. The best first DIY job.',
    whenShop: 'If you don\'t have a safe way to lift the car or a place to recycle the oil, a quick-lube or shop charge little for this.',
    tools: ['Socket/wrench for the drain plug', 'Oil filter wrench', 'Drain pan (6+ qt)', 'Funnel', 'Gloves & rags', 'Jack + jack stands or ramps', 'Torque wrench (recommended)'],
    parts: (p) => [`Engine oil: ${p.oil?.type || 'see manual'}; about ${p.oilQuarts || '4-5 qt'} (check exact capacity)`, 'Oil filter matched to your engine (look up by VIN)', 'New drain plug crush washer (if used)'],
    safety: ['Never get under a car supported only by a jack.', 'Hot oil burns: let the engine cool ~10-15 minutes first.', 'Recycle used oil; auto parts stores take it free.'],
    specs: (p) => [`Drain plug torque is often ~20-30 ft-lb on cars; aluminum oil pans strip easily. Confirm the spec for the ${p.label}.`, 'Oil filter: hand-tight plus ~3/4 turn after the gasket touches (follow filter instructions).'],
    steps: (p) => [
      { t: 'Warm up & park', d: 'Run the engine 2-3 minutes so oil flows better, then park on level ground, engine off, parking brake on.', b: 'Warm, not hot. You want to touch parts without getting burned.' },
      { t: 'Lift safely', d: liftNote(p), b: 'Jack stands are the non-negotiable safety step.' },
      { t: 'Drain the oil', d: 'Place the pan under the drain plug, loosen counter-clockwise, and remove by hand while pushing inward, then pull away quickly. Let it drain 5-10 minutes.', b: 'Oil shoots out at an angle. Position the pan a little behind the plug.' },
      { t: 'Reinstall the drain plug', d: 'Wipe it clean, fit a new crush washer if your car uses one, and tighten to spec. Don\'t overtighten.', b: 'Snug, not Hulk-tight.' },
      { t: 'Replace the filter', d: 'Unscrew the old filter (some are cartridge-style under a cap on top of the engine). Make sure the old rubber gasket came off with it. Smear fresh oil on the new gasket and spin it on.', b: 'A doubled-up old gasket is the #1 cause of big leaks after an oil change.' },
      { t: 'Refill', d: `Lower the car. Remove the oil fill cap and pour in slightly less than the listed capacity (${p.oilQuarts || '4-5 qt'} typical), then check the dipstick and top up to the full mark.`, b: 'Fill a little at a time; it\'s easy to add, annoying to remove.' },
      { t: 'Check for leaks & reset', d: 'Start the engine for 30 seconds, check under the car for drips, shut off, wait 2 min, recheck dipstick. Reset the oil-life monitor (see manual).', b: 'Write the date & mileage down (or in this app\'s schedule).' },
    ] },
  { id: 'brake-pads', title: 'Replace front brake pads', icon: '🛑', difficulty: 3, time: '1.5-3 hrs', priceId: 'brake-pads-front',
    summary: 'Swap worn pads (and rotors if needed) on the front axle.',
    whenShop: 'Brakes are safety-critical. If you\'ve never worked on brakes, consider doing it alongside someone experienced, or have a shop do it. Also see a shop if the pedal is soft or fluid is leaking.',
    tools: ['Jack + jack stands', 'Lug wrench', 'Socket set (caliper bolts are often 12-17 mm)', 'C-clamp or caliper piston tool', 'Torque wrench', 'Brake cleaner', 'Wire brush', 'Bungee cord or wire (to hang caliper)'],
    parts: (p) => ['Front brake pad set matched to your vehicle (ceramic for daily driving)', 'Brake hardware/clips (often included)', 'Brake lubricant for slide pins/contact points', p.bodyType === 'truck' ? 'Rotors if below minimum thickness (trucks often need heavier-duty pads if towing)' : 'Rotors if grooved or below minimum thickness'],
    safety: ['Work on one side at a time so you can use the other as a reference.', 'Never let the caliper hang by the rubber brake hose.', 'Brake dust: don\'t blow it with compressed air.', 'Pump the brake pedal several times before driving; the first press may go to the floor.'],
    specs: (p) => [`Lug nut torque: ${lugTorque(p)}. Confirm for the ${p.label}.`, 'Caliper bracket bolts are commonly 70-90+ ft-lb and guide pins ~20-30 ft-lb; these vary widely, so look up your exact spec. Many use threadlocker.'],
    steps: (p) => [
      { t: 'Loosen lugs, lift, remove wheel', d: 'Break the lug nuts loose while the wheel is on the ground, then jack up and set on stands. Remove the wheel.', b: 'Lefty-loosey. Loosen before lifting so the wheel doesn\'t spin.' },
      { t: 'Remove the caliper', d: 'Remove the two caliper guide-pin bolts (rear of the caliper). Swing or slide the caliper off the pads and hang it with a bungee.', b: 'Don\'t let it dangle on the hose.' },
      { t: 'Remove old pads & inspect', d: 'Pull the pads and clips. Inspect the rotor for deep grooves, a lip or blue spots. Measure thickness vs. the minimum stamped on the rotor.', b: 'Smooth and shiny is fine; deep grooves means new rotors.' },
      { t: 'Compress the piston', d: 'Place an old pad against the piston and slowly compress with a C-clamp. Watch the brake fluid reservoir so it doesn\'t overflow.', b: 'Go slow. Fluid rises as the piston goes back.' },
      { t: 'Install new hardware & pads', d: 'Clean the bracket with a wire brush, install new clips, apply a thin layer of brake lube to contact points (not pad faces), insert pads.', b: 'Keep grease and brake cleaner off the pad friction surface.' },
      { t: 'Reinstall caliper & wheel', d: 'Lube and reinstall guide pins, torque bolts to spec. Mount the wheel, hand tighten lugs in a star pattern, lower the car, torque lugs.', b: 'Star pattern = tighten opposite nuts, not around the circle.' },
      { t: 'Pump the pedal & bed in', d: 'Pump the pedal until firm. Bed in pads: several moderate stops from ~35 mph to 5 mph without coming to a full stop, then drive gently to cool.', b: 'Test brakes in an empty lot first.' },
    ] },
  { id: 'battery', title: 'Replace the 12V battery', icon: '🔋', difficulty: 1, time: '20-40 min', priceId: 'battery',
    summary: 'Swap a weak battery and clean the terminals.',
    whenShop: 'Some newer cars (many European models and some hybrids/EVs) have the battery under a seat or in the trunk and require a "battery registration" with a scan tool. Parts stores often install for free.',
    tools: ['10 mm wrench/socket (common)', 'Socket extension for the hold-down', 'Terminal brush', 'Gloves & eye protection', 'Optional memory saver'],
    parts: (p) => [`Battery in the correct group size for the ${p.label} (check old battery label or a fitment guide)`, 'Anti-corrosion spray/washers (optional)'],
    safety: ['Disconnect NEGATIVE (-, black) first, reconnect it LAST.', 'Don\'t let a wrench touch both terminals or the positive terminal and the body.', 'Batteries are heavy (30-50 lb) and contain acid; lift with your legs.', p_ev_hv_note()],
    specs: () => ['Terminal clamps: snug so they can\'t twist by hand; don\'t crush the posts.'],
    steps: (p) => [
      { t: 'Locate & confirm', d: 'Find the battery (usually under the hood; some are in the trunk or under a seat). Note which side is + and -.', b: 'Take a photo before removing anything.' },
      { t: 'Disconnect negative, then positive', d: 'Loosen the negative clamp and move the cable away. Then the positive.', b: 'Negative is usually black with a "-" sign.' },
      { t: 'Remove the hold-down & battery', d: 'Remove the bracket or strap, then lift the battery straight up.', b: 'Keep it upright.' },
      { t: 'Clean terminals', d: 'Brush cable clamps until shiny. Baking soda + water neutralizes white/green corrosion.', b: 'Corrosion alone can cause a no-start.' },
      { t: 'Install new battery', d: 'Set in the same orientation, secure the hold-down, connect positive first, then negative.', b: 'Red/+ first going on, black/- first coming off.' },
      { t: 'Test & reset', d: 'Start the car. You may need to reset the clock, radio presets or power-window auto-up. Return the old battery for the core refund.', b: 'Most stores refund a ~$15-25 core charge.' },
    ] },
  { id: 'engine-air-filter', title: 'Replace the engine air filter', icon: '💨', difficulty: 1, time: '5-15 min', notEV: true, priceId: 'engine-air-filter',
    summary: 'A 5-minute job that shops frequently upsell.',
    whenShop: 'Basically never needed. Do this one yourself.',
    tools: ['Screwdriver or socket (maybe)', 'Shop vac or rag'],
    parts: (p) => [`Engine air filter for the ${p.label}`],
    safety: ['Engine off. Don\'t let anything fall into the open intake.'],
    specs: () => ['Don\'t overtighten airbox screws; plastic threads strip.'],
    steps: () => [
      { t: 'Open the airbox', d: 'Find the black plastic box connected to a large intake tube. Release the clips or screws.', b: 'It\'s usually near the front/top of the engine.' },
      { t: 'Inspect & remove', d: 'Hold the filter up to light. If light barely passes, or it\'s full of debris, replace.', b: 'Gray and dusty = replace.' },
      { t: 'Clean the box', d: 'Wipe or vacuum leaves and debris out of the lower box.', b: '' },
      { t: 'Install & close', d: 'Drop in the new filter with the rubber edge seated all around. Close and re-clip.', b: 'Make sure no edge is pinched.' },
    ] },
  { id: 'cabin-air-filter', title: 'Replace the cabin air filter', icon: '🌬️', difficulty: 1, time: '10-20 min', priceId: 'cabin-air-filter',
    summary: 'Fixes musty smells and weak A/C airflow.',
    whenShop: 'On a few vehicles it\'s under the dash or hood cowl; still usually doable.',
    tools: ['None or a screwdriver', 'Flashlight'],
    parts: (p) => [`Cabin air filter for the ${p.label} (activated-carbon versions reduce odors)`],
    safety: ['Wear a mask if the old filter is moldy.'],
    specs: () => ['Note the AIRFLOW arrow direction on the filter.'],
    steps: () => [
      { t: 'Empty the glovebox', d: 'Most cabin filters are behind the glovebox.', b: '' },
      { t: 'Drop the glovebox', d: 'Squeeze the sides or remove the damper arm/stoppers so it swings down.', b: 'It\'s designed to flex; be gentle.' },
      { t: 'Remove the filter door', d: 'Unclip the rectangular cover and slide out the old filter. Note which way the arrow points.', b: 'Take a photo of the arrow.' },
      { t: 'Install new filter', d: 'Slide in the new filter with the arrow pointing the same way (usually down/toward the rear).', b: '' },
      { t: 'Reassemble', d: 'Clip the cover back on and reattach the glovebox.', b: 'Run the fan to confirm airflow.' },
    ] },
  { id: 'wiper-blades', title: 'Replace wiper blades', icon: '🌧️', difficulty: 1, time: '10 min', priceId: 'wiper-blades',
    summary: 'Easy visibility fix.', whenShop: 'Never needed; parts stores will often install for free.',
    tools: ['None', 'Towel (to protect windshield)'],
    parts: (p) => [`Driver + passenger blades in the correct lengths for the ${p.label} (they differ)`, 'Rear blade if equipped'],
    safety: ['Lay a towel on the glass: a spring-loaded arm snapping back can crack the windshield.'],
    specs: () => ['Check the connector type (J-hook is most common).'],
    steps: () => [
      { t: 'Lift the arm', d: 'Raise the wiper arm away from the glass (some cars need wipers set to "service position" first).', b: '' },
      { t: 'Release the old blade', d: 'Press the release tab and slide the blade down out of the J-hook.', b: '' },
      { t: 'Attach the new blade', d: 'Slide the new blade\'s adapter into the hook until it clicks.', b: 'Tug to confirm it\'s locked.' },
      { t: 'Lower and test', d: 'Gently lower the arm and test with washer fluid.', b: '' },
    ] },
  { id: 'tire-rotation', title: 'Rotate tires & set pressure', icon: '🛞', difficulty: 2, time: '45-60 min', priceId: 'tire-rotation',
    summary: 'Even out tire wear and check pressures.',
    whenShop: 'Many tire shops rotate free for tires bought there. Directional or staggered (different front/rear size) tires have restrictions.',
    tools: ['Floor jack', '2-4 jack stands', 'Lug wrench / breaker bar', 'Torque wrench', 'Tire pressure gauge', 'Air compressor (optional)'],
    parts: () => ['None'],
    safety: ['Use jack stands on solid ground. Chock the wheels that stay on the ground.', 'Re-torque lugs after ~50 miles.'],
    specs: (p) => [`Lug torque: ${lugTorque(p)}. Confirm for the ${p.label}.`, 'Correct pressure is on the sticker inside the driver\'s door jamb (not the tire sidewall max).'],
    steps: (p) => [
      { t: 'Know your pattern', d: p.awd ? 'For AWD/4WD: rearward cross (rears go forward to the opposite side, fronts go straight back), or front-to-back on same side if directional.' : 'For front-wheel drive: forward cross (fronts go straight back, rears cross to the opposite front).', b: 'If tires have an arrow on the sidewall, they\'re directional: swap front/back on the same side only.' },
      { t: 'Loosen lugs', d: 'Break all lug nuts loose a half turn with wheels on the ground.', b: '' },
      { t: 'Lift & support', d: 'Lift one side (or the whole car) at the factory points and set on stands.', b: '' },
      { t: 'Swap wheels', d: 'Move wheels per the pattern. Inspect each tire for nails, bulges and uneven wear.', b: 'Uneven inner-edge wear can mean alignment issues.' },
      { t: 'Tighten & lower', d: 'Snug lugs in a star pattern, lower the car, then torque to spec.', b: '' },
      { t: 'Set pressures', d: 'Set cold pressures to the door-jamb spec. Some cars need a TPMS relearn after rotation.', b: '' },
    ] },
  { id: 'coolant-check', title: 'Check & top up coolant', icon: '🌡️', difficulty: 1, time: '10 min', notEV: false, priceId: 'coolant-flush',
    summary: 'A safe monthly check that can prevent overheating.',
    whenShop: 'If you need to top up often, there\'s a leak; get it pressure-tested.',
    tools: ['Rag', 'Funnel', 'Flashlight'],
    parts: (p) => [`Coolant of the type specified for the ${p.label} (often pre-mixed 50/50). Don't mix types/colors.`],
    safety: ['NEVER open the radiator or reservoir cap when the engine is hot: scalding pressurized coolant can spray out.', 'Coolant is toxic and tastes sweet to pets. Clean up spills.'],
    specs: () => ['Fill to between MIN and MAX on the reservoir when cold.'],
    steps: () => [
      { t: 'Engine cold', d: 'Check first thing in the morning or after several hours parked.', b: 'Cold engine = safe.' },
      { t: 'Find the reservoir', d: 'A translucent plastic tank with MIN/MAX lines, often with a warning symbol on the cap.', b: '' },
      { t: 'Read the level', d: 'Coolant should sit between MIN and MAX.', b: '' },
      { t: 'Top up', d: 'Slowly open the cap and add the correct pre-mixed coolant to the MAX line.', b: 'Plain water is an emergency-only fix.' },
      { t: 'Watch for leaks', d: 'Check again in a few days. Falling level means a leak.', b: '' },
    ] },
  { id: 'spark-plugs', title: 'Replace spark plugs', icon: '⚡', difficulty: 3, time: '1-3 hrs', notEV: true, priceId: 'spark-plugs',
    summary: 'Restore smooth idle and fuel economy on high-mileage engines.',
    whenShop: 'On many V6/V8 engines the rear plugs are buried under the intake. Consider a shop. Some engines (e.g. certain older Ford 3-valve V8s) are known for plugs that break off.',
    tools: ['Spark plug socket (5/8" or 16 mm commonly)', 'Extensions + swivel', 'Torque wrench', 'Gap tool', 'Dielectric grease'],
    parts: (p) => [`Spark plugs specified for the ${p.label}'s engine (usually iridium/platinum)`, 'Ignition coil boots (optional)'],
    safety: ['Engine must be COLD; aluminum heads strip if you remove plugs hot.', 'Blow debris out of plug wells before removing plugs.'],
    specs: () => ['Plug torque is typically low (often ~13-20 ft-lb on aluminum heads); confirm the spec. Over-torquing can strip threads.', 'Check the gap against spec, but don\'t bend the fine tip on iridium plugs.'],
    steps: () => [
      { t: 'Remove engine cover & coils', d: 'Unplug each coil connector and remove its bolt; pull the coil straight out.', b: 'Do one cylinder at a time to avoid mixing things up.' },
      { t: 'Clean the well', d: 'Blow out debris with compressed air.', b: '' },
      { t: 'Remove old plug', d: 'Loosen with the plug socket and extension.', b: 'Read the old plug: oily or black deposits tell a story.' },
      { t: 'Install new plug', d: 'Thread by hand first (use a rubber hose to avoid cross-threading), then torque to spec.', b: 'If it doesn\'t thread easily by hand, stop.' },
      { t: 'Reinstall coil', d: 'Put a dab of dielectric grease in the boot, push the coil down, reinstall bolt and connector.', b: '' },
      { t: 'Repeat & test', d: 'Repeat for all cylinders, start the engine and confirm smooth idle with no check-engine light.', b: '' },
    ] },
  { id: 'headlight-bulb', title: 'Replace a headlight bulb', icon: '💡', difficulty: 1, time: '15-45 min', priceId: 'headlight-bulb',
    summary: 'Swap a burned-out halogen bulb.',
    whenShop: 'If your car has LED or HID headlights, the "bulb" may be a sealed unit or high-voltage; check the manual first.',
    tools: ['Gloves (don\'t touch halogen glass)', 'Screwdriver or socket (sometimes)'],
    parts: (p) => [`Bulb type for the ${p.label} (e.g. H11, 9005; check the manual or old bulb)`],
    safety: ['Let bulbs cool. Never touch halogen glass with bare fingers; oils shorten bulb life.'],
    specs: () => ['Replace in pairs for even brightness and color.'],
    steps: () => [
      { t: 'Access the back of the headlight', d: 'Open the hood; on some cars, turn the wheel and go through the wheel-well liner.', b: '' },
      { t: 'Unplug & twist out', d: 'Unplug the connector, twist the bulb counter-clockwise ~1/4 turn, pull out.', b: '' },
      { t: 'Install new bulb', d: 'Insert, twist to lock, reconnect.', b: '' },
      { t: 'Test', d: 'Check low and high beams.', b: '' },
    ] },
];

function p_ev_hv_note() { return 'On hybrids/EVs: only touch the 12V battery; orange cables are high voltage. Never service them.'; }

export function listGuides(profile) {
  return GUIDES.filter((g) => !(g.notEV && profile.isEV)).map((g) => ({ id: g.id, title: g.title, icon: g.icon, difficulty: g.difficulty, time: g.time, summary: g.summary }));
}

export function getGuide(id, profile, mode = 'beginner') {
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return null;
  if (g.notEV && profile.isEV) return { id, notApplicable: true, title: g.title, message: `The ${profile.label} is electric, so this job doesn't apply.` };
  const steps = g.steps(profile).map((s) => ({ title: s.t, detail: s.d, tip: s.b }));
  const base = { id: g.id, title: g.title, icon: g.icon, difficulty: g.difficulty, time: g.time, summary: g.summary, whenShop: g.whenShop, priceId: g.priceId,
    safety: g.safety, source: 'curated' };
  const canDiy = g.difficulty <= 2 ? 'Yes, great beginner job.' : g.difficulty === 3 ? 'Possible with patience, the right tools, and a careful read-through.' : 'Advanced; most people use a shop.';
  if (mode === 'diy') return { ...base, tools: g.tools, parts: g.parts(profile), specs: g.specs(profile), steps };
  return { ...base, canDiy, tools: g.tools.slice(0, 4), parts: g.parts(profile), specs: [], steps: steps.map((s) => ({ title: s.title, detail: s.tip ? `${s.detail} 💡 ${s.tip}` : s.detail })) };
}

export function findGuideByTopic(topic) {
  const q = String(topic).toLowerCase();
  const words = q.split(/\W+/).filter((w) => w.length > 2);
  let best = null; let bestScore = 0;
  for (const g of GUIDES) {
    const hay = `${g.id} ${g.title} ${g.summary}`.toLowerCase();
    const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { best = g; bestScore = score; }
  }
  return bestScore > 0 ? best.id : null;
}
