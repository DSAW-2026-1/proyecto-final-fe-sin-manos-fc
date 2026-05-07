const BASE = `${import.meta.env.VITE_API_URL}/api`
const getToken = () => localStorage.getItem('token')

const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` })

export const api = {
  register: (data) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  login: (data) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  logout: () => fetch(`${BASE}/auth/logout`, { method: 'POST', headers: headers() }),
  me: () => fetch(`${BASE}/auth/me`, { headers: headers() }).then(r => r.json()),

  getUser: (userId) => fetch(`${BASE}/users/${userId}`, { headers: headers() }).then(r => r.json()),
  updateUser: (userId, formData) => fetch(`${BASE}/users/${userId}`, { method: 'PUT', headers: authHeaders(), body: formData }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

  getProducts: (params = {}) => { const q = new URLSearchParams(params).toString(); return fetch(`${BASE}/products${q ? '?' + q : ''}`, { headers: headers() }).then(r => r.json()) },
  getProduct: (id) => fetch(`${BASE}/products/${id}`, { headers: headers() }).then(r => r.json()),
  myProducts: () => fetch(`${BASE}/products/my`, { headers: headers() }).then(r => r.json()),
  createProduct: (formData) => fetch(`${BASE}/products`, { method: 'POST', headers: authHeaders(), body: formData }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  updateProduct: (id, formData) => fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: authHeaders(), body: formData }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  deleteProduct: (id) => fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  getCategories: () => fetch(`${BASE}/categories`).then(r => r.json()),

  createReview: (data) => fetch(`${BASE}/reviews`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  getReviewsBySeller: (sellerId) => fetch(`${BASE}/users/${sellerId}/reviews`, { headers: headers() }).then(r => r.json()),
  getReviewsByProduct: (productId) => fetch(`${BASE}/reviews/product/${productId}`, { headers: headers() }).then(r => r.json()),
  markHelpful: (reviewId) => fetch(`${BASE}/reviews/${reviewId}/helpful`, { method: 'PATCH', headers: headers() }).then(r => r.json()),

  createOrder: (data) => fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  myOrders: () => fetch(`${BASE}/orders/my`, { headers: headers() }).then(r => r.json()),
}

export const convApi = {
  create: (data) => fetch(`${BASE}/conversations`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  list: () => fetch(`${BASE}/conversations`, { headers: headers() }).then(r => r.json()),
  getMessages: (convId, page = 1) => fetch(`${BASE}/conversations/${convId}/messages?page=${page}`, { headers: headers() }).then(r => r.json()),
  sendMessage: (convId, content) => fetch(`${BASE}/conversations/${convId}/messages`, { method: 'POST', headers: headers(), body: JSON.stringify({ content }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
}

export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
