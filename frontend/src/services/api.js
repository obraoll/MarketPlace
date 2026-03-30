import axios from 'axios'

const API_URL = 'http://localhost:8000/api/v1'

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
}

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/seller/my-products'),
  generateDescription: (data) => api.post('/products/ai/generate-description', data),
}

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart/'),
  addToCart: (data) => api.post('/cart/', data),
  updateCartItem: (id, data) => api.put(`/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart/'),
}

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders/', data),
  createFromCart: (data) => api.post('/orders/from-cart', data),
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data),
  getSellerOrders: () => api.get('/orders/seller/orders'),
  getSellerClients: () => api.get('/orders/seller/clients'),
  getSellerStats: () => api.get('/orders/seller/stats'),
  validatePromo: (code, subtotal) => api.get('/orders/promo/validate', { params: { code, subtotal } }),
}

// Admin API — gestion des vendeurs et vue d'ensemble du site uniquement
export const adminAPI = {
  getVendors: (params) => api.get('/admin/vendors', { params }),
  activateVendor: (id) => api.put(`/admin/vendors/${id}/activate`),
  deactivateVendor: (id) => api.put(`/admin/vendors/${id}/deactivate`),
  blockVendor: (id) => api.put(`/admin/vendors/${id}/block`),
  getStats: () => api.get('/admin/stats'),
  getPromos: () => api.get('/admin/promos'),
  createPromo: (data) => api.post('/admin/promos', data),
  togglePromo: (id) => api.put(`/admin/promos/${id}/toggle`),
  getReturnRequests: () => api.get('/admin/litiges/returns'),
  updateReturnStatus: (id, new_status) => api.put(`/admin/litiges/returns/${id}/status`, null, { params: { new_status } }),
  getSupportMessages: () => api.get('/admin/litiges/messages'),
}

// Account API
export const accountAPI = {
  getAccount: () => api.get('/account/me'),
  updateAccount: (data) => api.put('/account/me', data),
  changePassword: (data) => api.put('/account/password', data),
  deleteAccount: () => api.delete('/account/me'),
}

// Analytics API
export const analyticsAPI = {
  trackEvent: (data) => api.post('/analytics/events', data),
  getSellerSummary: (params) => api.get('/analytics/seller/summary', { params }),
  getAdminSummary: (params) => api.get('/analytics/admin/summary', { params }),
}

// Wishlist API (liée au compte)
export const wishlistAPI = {
  getIds: () => api.get('/wishlist/'),
  add: (product_id) => api.post('/wishlist/', { product_id }),
  remove: (product_id) => api.delete(`/wishlist/${product_id}`),
}

export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews/', data),
}

export const questionsAPI = {
  getByProduct: (productId) => api.get(`/questions/product/${productId}`),
  ask: (data) => api.post('/questions/', data),
}

export const supportAPI = {
  getMessages: () => api.get('/support/messages'),
  sendMessage: (data) => api.post('/support/messages', data),
  getReturns: () => api.get('/support/returns'),
  createReturn: (data) => api.post('/support/returns', data),
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
  getAdminTickets: () => api.get('/support/admin/tickets'),
  updateTicket: (ticketId, data) => api.put(`/support/tickets/${ticketId}`, data),
}

export default api
