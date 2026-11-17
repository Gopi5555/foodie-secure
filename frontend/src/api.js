async function req(url, method = 'GET', body) {
  const t = localStorage.getItem('token')
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  if (r.status === 401 && !url.startsWith('/api/auth/')) { localStorage.clear(); window.location.href = '/login'; throw new Error('Session expired') }
  const text = await r.text(); let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* not json */ }
  if (!r.ok) throw new Error(data?.message || (r.status === 403 ? 'Not allowed' : 'Something went wrong'))
  return data
}
export const api = {
  register: (b) => req('/api/auth/register', 'POST', b),
  login: (b) => req('/api/auth/login', 'POST', b),
  verifyOtp: (b) => req('/api/auth/verify-otp', 'POST', b),
  forgot: (b) => req('/api/auth/forgot-password', 'POST', b),
  reset: (b) => req('/api/auth/reset-password', 'POST', b),
  profile: () => req('/api/profile'),
  saveProfile: (b) => req('/api/profile', 'PUT', b),
  restaurants: () => req('/api/restaurants'),
  restaurant: (id) => req(`/api/restaurants/${id}`),
  menu: (id) => req(`/api/restaurants/${id}/menu`),
  foods: () => req('/api/restaurants/foods'),
  addRestaurant: (b) => req('/api/restaurants', 'POST', b),
  deleteRestaurant: (id) => req(`/api/restaurants/${id}`, 'DELETE'),
  addFood: (rid, b) => req(`/api/restaurants/${rid}/menu`, 'POST', b),
  deleteFood: (id) => req(`/api/restaurants/foods/${id}`, 'DELETE'),
  placeOrder: (b) => req('/api/orders', 'POST', b),
  orders: () => req('/api/orders'),
}
