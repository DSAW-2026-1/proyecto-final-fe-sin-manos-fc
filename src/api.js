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
  createOrderSingle: (productId) => fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify({ productId }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  createOrderFromCart: (data) => fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  myOrders: (params = {}) => { const q = new URLSearchParams(params).toString(); return fetch(`${BASE}/orders/my${q ? '?' + q : ''}`, { headers: headers() }).then(r => r.json()) },
  myVentas: () => fetch(`${BASE}/orders/selling`, { headers: headers() }).then(r => r.json()),
  updateOrderStatus: (orderId, status) => fetch(`${BASE}/orders/${orderId}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

  getNotifications: () => fetch(`${BASE}/notifications`, { headers: headers() }).then(r => r.json()),
  markNotificationRead: (id) => fetch(`${BASE}/notifications/${id}/read`, { method: 'PATCH', headers: headers() }).then(r => r.json()),
  markAllNotificationsRead: () => fetch(`${BASE}/notifications/read-all`, { method: 'PATCH', headers: headers() }).then(r => r.json()),

  getCart: () => fetch(`${BASE}/cart`, { headers: headers() }).then(r => r.json()),
  addToCart: ({ productId, quantity = 1 }) => fetch(`${BASE}/cart/items`, { method: 'POST', headers: headers(), body: JSON.stringify({ productId, quantity }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  removeFromCart: (productId) => fetch(`${BASE}/cart/items/${productId}`, { method: 'DELETE', headers: headers() }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),

  getDashboard: () => fetch(`${BASE}/admin/dashboard`, { headers: headers() }).then(r => r.json()),
  getAdminUsers: () => fetch(`${BASE}/admin/users`, { headers: headers() }).then(r => r.json()),
  suspendUser: (userId, suspended, reason) => fetch(`${BASE}/admin/users/${userId}/suspend`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ suspended, reason }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  deleteProductAdmin: (productId, reason) => fetch(`${BASE}/admin/products/${productId}`, { method: 'DELETE', headers: headers(), body: JSON.stringify({ reason }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  getAdminReports: () => fetch(`${BASE}/admin/reports`, { headers: headers() }).then(r => r.json()),
  updateReport: (reportId, status) => fetch(`${BASE}/admin/reports/${reportId}`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  createReport: (data) => fetch(`${BASE}/reports`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
}

export const convApi = {
  create: (data) => fetch(`${BASE}/conversations`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d }))),
  list: () => fetch(`${BASE}/conversations`, { headers: headers() }).then(r => r.json()),
  getMessages: (convId, page = 1) => fetch(`${BASE}/conversations/${convId}/messages?page=${page}`, { headers: headers() }).then(r => r.json()),
  sendMessage: (convId, content) => fetch(`${BASE}/conversations/${convId}/messages`, { method: 'POST', headers: headers(), body: JSON.stringify({ content }) }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
  deleteConversation: (convId) => fetch(`${BASE}/conversations/${convId}`, { method: 'DELETE', headers: headers() }).then(r => r.json().then(d => ({ ok: r.ok, data: d }))),
}

export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
