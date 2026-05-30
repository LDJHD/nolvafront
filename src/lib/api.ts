import axios from 'axios'
import { getApiUrl } from './apiConfig'

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nolva_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gérer l'expiration du token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname
      const publicPaths = ['/login', '/register', '/mot-de-passe']
      if (!publicPaths.some((p) => path.startsWith(p))) {
        localStorage.removeItem('nolva_token')
        localStorage.removeItem('nolva_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { uid: string; password: string }) => api.post('/auth/login', data),
  forgotPassword: (data: { uid: string }) => api.post('/auth/forgot-password', data),
  verifyResetToken: (token: string) =>
    api.get('/auth/verify-reset-token', { params: { token } }),
  resetPassword: (data: { token: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
}

// ─── Prestataires ─────────────────────────────────────────
export const providersApi = {
  list: (params?: any) => api.get('/providers', { params }),
  popular: () => api.get('/providers/popular'),
  show: (id: number | string) => api.get(`/providers/${id}`),
  myProfile: () => api.get('/provider/profile'),
  updateMyProfile: (data: any) => api.put('/provider/profile', data),
  addPhoto: (data: { url: string }) => api.post('/provider/photos', data),
  addPhotosBatch: (data: { urls: string[] }) => api.post('/provider/photos/batch', data),
  deletePhoto: (id: number) => api.delete(`/provider/photos/${id}`),
  listPayoutMessages: (params: { provider_id: number; transaction_id?: number }) =>
    api.get('/provider/payout-messages', { params }),
  postPayoutMessage: (data: { provider_id: number; transaction_id?: number; body: string }) =>
    api.post('/provider/payout-messages', data),
}

// ─── Offres ───────────────────────────────────────────────
export const offersApi = {
  create: (data: any) => api.post('/provider/offers', data),
  update: (id: number, data: any) => api.put(`/provider/offers/${id}`, data),
  delete: (id: number) => api.delete(`/provider/offers/${id}`),
}

// ─── Disponibilités ───────────────────────────────────────
export const availabilityApi = {
  update: (data: any) => api.put('/provider/availability', data),
}

// ─── Demandes de devis ────────────────────────────────────
export const quoteRequestsApi = {
  create: (data: any) => api.post('/user/quote-requests', data),
  myRequests: (params?: any) => api.get('/user/quote-requests', { params }),
  show: (id: number | string) => api.get(`/user/quote-requests/${id}`),
  postMessage: (id: number | string, body: string) =>
    api.post(`/user/quote-requests/${id}/messages`, { body }),
  providerRequests: (params?: any) => api.get('/provider/quote-requests', { params }),
  providerShow: (id: number | string) => api.get(`/provider/quote-requests/${id}`),
  providerPostMessage: (id: number | string, body: string) =>
    api.post(`/provider/quote-requests/${id}/messages`, { body }),
  updateStatus: (id: number, data: { status: string; agreed_price?: number }) =>
    api.put(`/provider/quote-requests/${id}/status`, data),
}

// ─── Réservations ─────────────────────────────────────────
export const reservationsApi = {
  create: (data: any) => api.post('/user/reservations', data),
  myReservations: (params?: any) => api.get('/user/reservations', { params }),
  show: (id: number) => api.get(`/user/reservations/${id}`),
  providerReservations: (params?: any) => api.get('/provider/reservations', { params }),
  awardProviderPoints: (id: number, points: 0 | 3 | 5) =>
    api.post(`/user/reservations/${id}/provider-points`, { points }),
}

// ─── Paiements (FedaPay) ──────────────────────────────────
export const paymentsApi = {
  // Tickets
  buyTicket: (data: {
    event_id: number
    ticket_type_id?: number
    type?: string
    quantity?: number
  }) => api.post('/payments/ticket/buy', data),
  confirmTicket: (data: { transaction_ref: string }) => api.post('/payments/ticket/confirm', data),
  // Réservations prestataire
  initiateReservation: (reservationId: number) => api.post(`/payments/reservation/${reservationId}/initiate`),
  confirmReservation: (data: { transaction_ref: string }) => api.post('/payments/reservation/confirm', data),
  // Validation service
  validateService: (data: { reservation_id: number }) => api.post('/payments/service/validate', data),
  // Litiges
  openDispute: (data: { transaction_ref: string; reason: string }) => api.post('/payments/dispute/open', data),
  getReservationTransaction: (reservationId: number) =>
    api.get(`/payments/transaction/reservation/${reservationId}`),
}

// ─── Catalogue (types) ────────────────────────────────────
export const notificationsApi = {
  list: (params?: { limit?: number }) => api.get('/notifications', { params }),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

export const catalogApi = {
  eventTypes: () => api.get('/catalog/event-types'),
  providerTypes: () => api.get('/catalog/provider-types'),
}

// ─── Admin NOLVA ─────────────────────────────────────────
export const adminApi = {
  transactions: (params?: any) => api.get('/admin/transactions', { params }),
  payouts: (params?: any) => api.get('/admin/payouts', { params }),
  pendingPayouts: () => api.get('/admin/payouts/pending'),
  listPayoutMessages: (params: { provider_id: number; transaction_id?: number }) =>
    api.get('/admin/payout-messages', { params }),
  postPayoutMessage: (data: { provider_id: number; transaction_id?: number; body: string }) =>
    api.post('/admin/payout-messages', data),
  runEscrowRelease: () => api.post('/admin/escrow/release'),
  commissionStats: () => api.get('/admin/commissions/stats'),
  freezeTransaction: (data: { transaction_ref: string; note: string }) =>
    api.post('/admin/transactions/freeze', data),
  executePayout: (data: {
    transaction_id: number
    amount?: number
    payout_method: string
    payout_destination: string
    note?: string
  }) => api.post('/admin/payouts/execute', data),
  disputeRepayment: (data: {
    transaction_ref: string
    amount: number
    mode: 'collect_client' | 'payout_provider'
    payout_method?: string
    payout_destination?: string
    note?: string
  }) => api.post('/admin/disputes/repayment', data),
  contactRefundOrganizer: (data: { transaction_ref: string; note?: string }) =>
    api.post('/admin/disputes/contact-organizer', data),
  refundClient: (data: {
    transaction_ref: string
    amount?: number
    payout_method: string
    payout_destination: string
    note?: string
  }) => api.post('/admin/disputes/refund-client', data),
  actionHistory: (params?: { page?: number; transaction_id?: number }) =>
    api.get('/admin/action-history', { params }),
  resolveDispute: (data: {
    transaction_ref: string
    action: 'release' | 'refund' | 'split'
    split_percentage?: number
    note?: string
  }) => api.post('/admin/disputes/resolve', data),
  listCommissions: () => api.get('/admin/commissions'),
  createCommission: (data: any) => api.post('/admin/commissions', data),
  updateCommission: (id: number, data: any) => api.put(`/admin/commissions/${id}`, data),
  deleteCommission: (id: number) => api.delete(`/admin/commissions/${id}`),
  pendingEvents: () => api.get('/admin/events/pending'),
  approveEvent: (id: number) => api.post(`/admin/events/${id}/approve`),
  rejectEvent: (id: number, data: { note: string }) =>
    api.post(`/admin/events/${id}/reject`, data),
  listEventTypes: () => api.get('/admin/catalog/event-types'),
  createEventType: (data: { label: string; slug?: string; sort_order?: number }) =>
    api.post('/admin/catalog/event-types', data),
  updateEventType: (id: number, data: any) => api.put(`/admin/catalog/event-types/${id}`, data),
  deleteEventType: (id: number) => api.delete(`/admin/catalog/event-types/${id}`),
  listProviderTypes: () => api.get('/admin/catalog/provider-types'),
  createProviderType: (data: { label: string; slug?: string; sort_order?: number }) =>
    api.post('/admin/catalog/provider-types', data),
  updateProviderType: (id: number, data: any) =>
    api.put(`/admin/catalog/provider-types/${id}`, data),
  deleteProviderType: (id: number) => api.delete(`/admin/catalog/provider-types/${id}`),
  listManageEvents: (params?: any) => api.get('/admin/manage/events', { params }),
  updateManageEvent: (id: number, data: any) => api.put(`/admin/manage/events/${id}`, data),
  listManageProviders: (params?: any) => api.get('/admin/manage/providers', { params }),
  updateManageProvider: (id: number, data: any) => api.put(`/admin/manage/providers/${id}`, data),
  listManageQuoteRequests: (params?: any) => api.get('/admin/manage/quote-requests', { params }),
  updateManageQuoteRequest: (id: number, data: { status: string }) =>
    api.put(`/admin/manage/quote-requests/${id}`, data),
  listQuoteActivities: (params?: any) => api.get('/admin/manage/quote-activities', { params }),
}

// ─── Événements ───────────────────────────────────────────
export const eventsApi = {
  list: (params?: any) => api.get('/events', { params }),
  show: (id: number | string) => api.get(`/events/${id}`),
  publishSuggestions: (params: { event_type: string; title?: string; city?: string }) =>
    api.get('/events/publish-suggestions', { params }),
  create: (data: any) => api.post('/events', data),
  myEvents: (params?: any) => api.get('/user/events', { params }),
  cancelMine: (id: number | string, data?: { reason?: string }) =>
    api.post(`/user/events/${id}/cancel`, data || {}),
  rescheduleMine: (
    id: number | string,
    data: { event_date: string; location?: string; city?: string }
  ) => api.post(`/user/events/${id}/reschedule`, data),
  ticketSales: (id: number | string) => api.get(`/user/events/${id}/ticket-sales`),
  myTickets: (params?: any) => api.get('/user/tickets', { params }),
}
