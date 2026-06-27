import type {
  ApiResponse,
  AuthResponse,
  Draw,
  DrawDetail,
  DrawsResponse,
  Ticket,
  TicketsResponse,
  TransactionsResponse,
  NotificationsResponse,
  UnreadCountResponse,
  Wallet,
  User,
} from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class ApiClient {
  private token: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<boolean> | null = null

  constructor() {
    this.token = localStorage.getItem('accessToken')
    this.refreshToken = localStorage.getItem('refreshToken')
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken
    this.refreshToken = refreshToken
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  clearTokens() {
    this.token = null
    this.refreshToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.attemptRefresh()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        })
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(errorBody.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  private async attemptRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        })
        if (!res.ok) {
          this.clearTokens()
          return false
        }
        const data = await res.json()
        if (data.success) {
          this.setTokens(data.data.accessToken, data.data.refreshToken)
          return true
        }
        this.clearTokens()
        return false
      } catch {
        this.clearTokens()
        return false
      }
    })()

    const result = await this.refreshPromise
    this.refreshPromise = null
    return result
  }

  isAuthenticated(): boolean {
    return this.token !== null
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.success) {
      this.setTokens(res.data.accessToken, res.data.refreshToken)
    }
    return res
  }

  async register(email: string, password: string, displayName?: string): Promise<ApiResponse<AuthResponse>> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    })
    if (res.success) {
      this.setTokens(res.data.accessToken, res.data.refreshToken)
    }
    return res
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        })
      }
    } catch {
      // Logout is best-effort
    }
    this.clearTokens()
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me')
  }

  async getBalance(): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>('/wallet/balance')
  }

  async getTransactions(page = 1): Promise<ApiResponse<TransactionsResponse>> {
    return this.request<TransactionsResponse>(`/wallet/transactions?page=${page}&limit=20`)
  }

  async getActiveDraws(): Promise<ApiResponse<Draw[]>> {
    return this.request<Draw[]>('/draws/active')
  }

  async getCompletedDraws(page = 1): Promise<ApiResponse<DrawsResponse>> {
    return this.request<DrawsResponse>(`/draws/completed?page=${page}&limit=20`)
  }

  async getDraw(id: string): Promise<ApiResponse<DrawDetail>> {
    return this.request<DrawDetail>(`/draws/${id}`)
  }

  async purchaseTicket(drawId: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>('/tickets/purchase', {
      method: 'POST',
      body: JSON.stringify({ drawId }),
    })
  }

  async getMyTickets(page = 1): Promise<ApiResponse<TicketsResponse>> {
    return this.request<TicketsResponse>(`/tickets/my?page=${page}&limit=20`)
  }

  async getNotifications(page = 1): Promise<ApiResponse<NotificationsResponse>> {
    return this.request<NotificationsResponse>(`/notifications?page=${page}&limit=20`)
  }

  async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
    return this.request<UnreadCountResponse>('/notifications/unread-count')
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'PATCH' })
  }
}

export const api = new ApiClient()
