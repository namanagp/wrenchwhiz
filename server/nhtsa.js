// Thin, cached wrapper around NHTSA's free public APIs.
// vPIC: https://vpic.nhtsa.dot.gov/api/   Recalls/Complaints: https://api.nhtsa.gov/

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const NHTSA = 'https://api.nhtsa.gov';
const cache = new Map();
const TTL = 1000 * 60 * 60 * 12;

async function getJSON(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'WrenchWhiz-demo/1.0' } });
    if (!res.ok) throw new Error(`NHTSA ${res.status} for ${url}`);
    const v = await res.json();
    cache.set(url, { t: Date.now(), v });
    return v;
  } finally { clearTimeout(timer); }
}

export const POPULAR_MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Jeep', 'Ram',
  'GMC', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Tesla', 'Dodge', 'Acura', 'Buick', 'Cadillac', 'Chrysler',
  'Infiniti', 'Lincoln', 'Mitsubishi', 'Volvo', 'Genesis', 'Porsche', 'Mini', 'Land Rover', 'Jaguar', 'Alfa Romeo', 'Fiat', 'Rivian', 'Polestar', 'Pontiac', 'Saturn', 'Scion', 'Mercury'];

const TYPES = ['car', 'truck', 'multipurpose passenger vehicle (mpv)'];

const titleCase = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\bBmw\b/, 'BMW').replace(/\bGmc\b/, 'GMC').replace(/\bMini\b/, 'Mini');

export async function getMakes() {
  const lists = await Promise.all(TYPES.map((t) => getJSON(`${VPIC}/GetMakesForVehicleType/${encodeURIComponent(t)}?format=json`).catch(() => ({ Results: [] }))));
  const map = new Map();
  for (const l of lists) for (const r of l.Results || []) {
    const name = String(r.MakeName || '').trim();
    if (name && !map.has(name.toUpperCase())) map.set(name.toUpperCase(), { id: r.MakeId, name: titleCase(name) });
  }
  const popularSet = new Set(POPULAR_MAKES.map((m) => m.toUpperCase()));
  const popular = POPULAR_MAKES.map((m) => map.get(m.toUpperCase()) || { id: null, name: m });
  const others = [...map.entries()].filter(([k]) => !popularSet.has(k)).map(([, v]) => v).sort((a, b) => a.name.localeCompare(b.name));
  return { popular, others, total: map.size };
}

export async function getModels(make, year) {
  const m = encodeURIComponent(make);
  const results = await Promise.all(TYPES.map((t) =>
    getJSON(`${VPIC}/GetModelsForMakeYear/make/${m}/modelyear/${year}/vehicletype/${encodeURIComponent(t)}?format=json`)
      .then((d) => (d.Results || []).map((r) => ({ name: String(r.Model_Name).trim(), makeName: r.Make_Name, type: t.startsWith('multi') ? 'mpv' : t })))
      .catch(() => [])));
  const seen = new Map();
  for (const r of results.flat()) {
    // vPIC "make" search is a substring match (e.g. "ford" -> "Bradford"); keep exact make only
    if (String(r.makeName).toUpperCase() !== make.toUpperCase()) continue;
    if (!/^[A-Za-z0-9]/.test(r.name)) continue;
    const k = r.name.toUpperCase();
    if (!seen.has(k)) seen.set(k, { name: r.name, type: r.type });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// NHTSA returns DD/MM/YYYY; show an unambiguous "Dec 18, 2019"
function fmtDate(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || ''));
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[1])}, ${m[3]}` : s;
}

export async function getRecalls(make, model, year) {
  const url = `${NHTSA}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
  const d = await getJSON(url);
  return (d.results || []).map((r) => ({
    campaign: r.NHTSACampaignNumber, component: r.Component, summary: r.Summary, consequence: r.Consequence, remedy: r.Remedy,
    date: fmtDate(r.ReportReceivedDate), manufacturer: r.Manufacturer, parkIt: !!r.parkIt, parkOutside: !!r.parkOutSide, overTheAir: !!r.overTheAirUpdate,
    url: `https://www.nhtsa.gov/recalls?nhtsaId=${r.NHTSACampaignNumber}`,
  }));
}

export async function getComplaintsSummary(make, model, year) {
  const url = `${NHTSA}/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
  const d = await getJSON(url);
  const rows = d.results || [];
  const counts = {};
  let crashes = 0; let fires = 0;
  for (const r of rows) {
    if (String(r.crash).toLowerCase() === 'true' || r.crash === true) crashes++;
    if (String(r.fire).toLowerCase() === 'true' || r.fire === true) fires++;
    for (const c of String(r.components || '').split(',')) { const k = c.trim(); if (k) counts[k] = (counts[k] || 0) + 1; }
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([component, count]) => ({ component, count }));
  return { total: rows.length, crashes, fires, top, url: 'https://www.nhtsa.gov/vehicle' };
}

export async function decodeVin(vin) {
  const d = await getJSON(`${VPIC}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
  const r = d.Results?.[0] || {};
  return {
    vin, year: r.ModelYear, make: r.Make ? titleCase(r.Make) : '', model: r.Model, trim: r.Trim, bodyClass: r.BodyClass,
    engine: [r.DisplacementL ? `${Number(r.DisplacementL).toFixed(1)}L` : '', r.EngineCylinders ? `${r.EngineCylinders}-cyl` : '', r.EngineConfiguration].filter(Boolean).join(' '),
    fuel: r.FuelTypePrimary, drive: r.DriveType, transmission: r.TransmissionStyle, vehicleType: r.VehicleType,
    errorCode: r.ErrorCode, errorText: r.ErrorText,
  };
}
