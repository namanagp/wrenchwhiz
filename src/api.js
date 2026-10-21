async function req(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
const post = (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) });

export const api = {
  health: () => req('/api/health'),
  makes: () => req('/api/makes'),
  models: (make, year) => req(`/api/models?make=${encodeURIComponent(make)}&year=${year}`),
  recalls: (v) => req(`/api/recalls?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&year=${v.year}`),
  vin: (vin) => req(`/api/vin/${encodeURIComponent(vin)}`),
  profile: (vehicle) => post('/api/profile', { vehicle }),
  maintenance: (vehicle, mode, mileage) => post('/api/maintenance', { vehicle, mode, mileage }),
  symptoms: (vehicle, mode, text) => post('/api/symptoms', { vehicle, mode, text }),
  guides: (vehicle) => post('/api/guides', { vehicle }),
  guide: (vehicle, mode, id) => post(`/api/guides/${id}`, { vehicle, mode }),
  generateGuide: (vehicle, mode, topic) => post('/api/guides/generate', { vehicle, mode, topic }),
  prices: (vehicle, laborRate) => post('/api/prices', { vehicle, laborRate }),
  chat: (vehicle, mode, messages, context) => post('/api/chat', { vehicle, mode, messages, context }),
};
