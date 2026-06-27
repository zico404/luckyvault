export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface User {
  id: string
  email: string
  displayName: string | null
  role: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Wallet {
  balance: number
  currency: string
}

export interface Draw {
  id: string
  title: string
  description: string | null
  ticketPrice: number
  maxTickets: number
  soldTickets: number
  prizePool: number
  winnerCount: number
  status: 'UPCOMING' | 'OPEN' | 'LOCKED' | 'DRAWING' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string
  completedAt: string | null
  resultHash: string | null
  resultSalt: string | null
}

export interface DrawDetail extends Draw {
  tickets: { id: string; ticketCode: string; userId: string; status: string }[]
  winners: Winner[]
}

export interface DrawsResponse {
  draws: Draw[]
  total: number
  page: number
  totalPages: number
}

export interface Ticket {
  id: string
  ticketCode: string
  drawId: string
  status: string
  qrCodeUrl: string | null
  purchasePrice: number
  createdAt: string
  draw: DrawSummary | null
}

export interface DrawSummary {
  id: string
  title: string
  status: string
  scheduledAt: string
}

export interface TicketsResponse {
  tickets: Ticket[]
  total: number
  page: number
  totalPages: number
}

export interface Transaction {
  id: string
  type: string
  amount: number
  balanceAfter: number
  status: string
  description: string | null
  createdAt: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
}

export interface Winner {
  drawId: string
  ticketId: string
  userId: string
  prize: number
  rank: number
}

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
}

export interface UnreadCountResponse {
  count: number
}
