import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/Toast'
import { api } from '@/lib/api'
import {
  Shield, CheckCircle, XCircle, Clock, DollarSign, Users, Activity,
  ArrowLeft, ChevronRight, Play, Pause, Zap, RefreshCw, Search,
  TrendingUp, UserCheck, Ban, Eye
} from 'lucide-react'

interface PendingTopUp {
  id: string
  userId: string
  amount: number
  paymentMethod: string
  status: string
  description: string | null
  createdAt: string
  user?: { email: string; displayName: string | null }
}

interface AdminUser {
  id: string
  email: string
  displayName: string | null
  role: string
  isActive: boolean
  createdAt: string
}

interface AdminDraw {
  id: string
  title: string
  status: string
  ticketPrice: number
  maxTickets: number
  soldTickets: number
  winnerCount: number
  scheduledAt: string
}

type Tab = 'topups' | 'users' | 'draws' | 'activity'

export function AdminPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('topups')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [pendingTopUps, setPendingTopUps] = useState<PendingTopUp[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [draws, setDraws] = useState<AdminDraw[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, activeDraws: 0, pendingTopUps: 0 })

  const fetchTopUps = useCallback(async () => {
    try {
      const result = await api.getPendingTopUps()
      if (result.data) {
        setPendingTopUps(result.data)
        setStats(prev => ({ ...prev, pendingTopUps: result.data.length }))
      }
    } catch {
      toast('Failed to load pending top-ups', 'error')
    }
  }, [toast])

  const fetchUsers = useCallback(async () => {
    try {
      const result = await api.getAdminUsers(1, 50)
      if (result.data?.users) {
        setUsers(result.data.users)
        setStats(prev => ({ ...prev, totalUsers: result.data.users.length }))
      } else if (Array.isArray(result.data)) {
        setUsers(result.data)
        setStats(prev => ({ ...prev, totalUsers: result.data.length }))
      }
    } catch {
      toast('Failed to load users', 'error')
    }
  }, [toast])

  const fetchDraws = useCallback(async () => {
    try {
      const result = await api.getAdminDraws(1, 50)
      if (result.data?.draws) {
        setDraws(result.data.draws)
        setStats(prev => ({ ...prev, activeDraws: result.data.draws.filter((d: AdminDraw) => d.status === 'OPEN').length }))
      } else if (Array.isArray(result.data)) {
        setDraws(result.data)
        setStats(prev => ({ ...prev, activeDraws: result.data.filter((d: AdminDraw) => d.status === 'OPEN').length }))
      }
    } catch {
      toast('Failed to load draws', 'error')
    }
  }, [toast])

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchTopUps(), fetchUsers(), fetchDraws()])
      setLoading(false)
    }
    loadAll()
  }, [fetchTopUps, fetchUsers, fetchDraws])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await api.approveTopUp(id)
      setPendingTopUps(prev => prev.filter(t => t.id !== id))
      setStats(prev => ({ ...prev, pendingTopUps: Math.max(0, prev.pendingTopUps - 1) }))
      toast('Top-up approved', 'success')
    } catch {
      toast('Failed to approve top-up', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      await api.rejectTopUp(id)
      setPendingTopUps(prev => prev.filter(t => t.id !== id))
      setStats(prev => ({ ...prev, pendingTopUps: Math.max(0, prev.pendingTopUps - 1) }))
      toast('Top-up rejected', 'success')
    } catch {
      toast('Failed to reject top-up', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleExecuteDraw = async (id: string) => {
    setProcessingId(id)
    try {
      await api.executeDraw(id)
      await fetchDraws()
      toast('Draw executed successfully', 'success')
    } catch {
      toast('Failed to execute draw', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleOpenDraw = async (id: string) => {
    setProcessingId(id)
    try {
      await api.openDraw(id)
      await fetchDraws()
      toast('Draw opened', 'success')
    } catch {
      toast('Failed to open draw', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'topups', label: 'Top-ups', icon: <DollarSign className="w-4 h-4" />, count: stats.pendingTopUps },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, count: stats.totalUsers },
    { key: 'draws', label: 'Draws', icon: <Activity className="w-4 h-4" />, count: stats.activeDraws },
    { key: 'activity', label: 'Activity', icon: <Eye className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--vault-black)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 vault-glass" style={{ borderBottom: '1px solid var(--vault-subtle)' }}>
        <div className="max-w-[960px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--vault-charcoal)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
              <span className="text-base md:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Admin</span>
            </div>
          </div>
          <span className="vault-badge vault-badge-champagne hidden sm:inline-flex">
            {stats.pendingTopUps} pending
          </span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 md:px-6 py-5 md:py-6">
        {/* Stats — horizontal scroll on mobile */}
        <div className="flex gap-3 md:gap-4 mb-5 md:mb-6 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
          <StatCard
            icon={<Users className="w-4 h-4 md:w-5 md:h-5" />}
            label="Users"
            value={loading ? '—' : stats.totalUsers.toString()}
            color="var(--champagne)"
          />
          <StatCard
            icon={<Activity className="w-4 h-4 md:w-5 md:h-5" />}
            label="Active Draws"
            value={loading ? '—' : stats.activeDraws.toString()}
            color="var(--emerald)"
          />
          <StatCard
            icon={<Clock className="w-4 h-4 md:w-5 md:h-5" />}
            label="Pending"
            value={loading ? '—' : stats.pendingTopUps.toString()}
            color="var(--amber)"
            highlight={stats.pendingTopUps > 0}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5 md:mb-6" style={{ background: 'var(--vault-graphite)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-all min-w-0"
              style={{
                background: activeTab === tab.key ? 'var(--vault-charcoal)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                  style={{
                    background: activeTab === tab.key ? 'var(--champagne-subtle)' : 'var(--vault-subtle)',
                    color: activeTab === tab.key ? 'var(--champagne)' : 'var(--text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'topups' && (
            <TopUpsTab
              topUps={pendingTopUps}
              loading={loading}
              processingId={processingId}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
          {activeTab === 'users' && (
            <UsersTab users={users} loading={loading} />
          )}
          {activeTab === 'draws' && (
            <DrawsTab
              draws={draws}
              loading={loading}
              processingId={processingId}
              onExecute={handleExecuteDraw}
              onOpen={handleOpenDraw}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityTab loading={loading} />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, highlight }: {
  icon: React.ReactNode; label: string; value: string; color: string; highlight?: boolean
}) {
  return (
    <div
      className="vault-card p-4 md:p-5 min-w-[140px] md:min-w-0 flex-shrink-0 md:flex-shrink transition-all"
      style={highlight ? { borderColor: `${color}40` } : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          <p className="text-[11px] md:text-xs truncate" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Top-ups Tab ────────────────────────────────────────── */
function TopUpsTab({ topUps, loading, processingId, onApprove, onReject }: {
  topUps: PendingTopUp[]; loading: boolean; processingId: string | null
  onApprove: (id: string) => void; onReject: (id: string) => void
}) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="vault-card p-4 md:p-5"><div className="shimmer h-14 md:h-16 w-full" /></div>
      ))}
    </div>
  )

  if (topUps.length === 0) return (
    <EmptyState
      icon={<CheckCircle className="w-10 h-10 md:w-12 md:h-12" />}
      title="All caught up"
      description="No pending top-ups to review"
      color="var(--emerald)"
    />
  )

  return (
    <div className="space-y-3">
      {topUps.map(topUp => (
        <div key={topUp.id} className="vault-card p-4 md:p-5">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--amber)' }}
              >
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>
                  ${Number(topUp.amount).toFixed(2)} top-up
                </p>
                <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                  {topUp.user?.email || 'Unknown'}
                </p>
                <p className="text-[11px] md:text-xs mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                  {topUp.paymentMethod} · {new Date(topUp.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <button
                onClick={() => onReject(topUp.id)}
                disabled={processingId === topUp.id}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--vault-charcoal)',
                  color: 'var(--text-secondary)',
                  opacity: processingId === topUp.id ? 0.5 : 1,
                }}
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(topUp.id)}
                disabled={processingId === topUp.id}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--emerald)',
                  color: '#fff',
                  opacity: processingId === topUp.id ? 0.5 : 1,
                }}
              >
                {processingId === topUp.id ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Wait
                  </span>
                ) : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Users Tab ──────────────────────────────────────────── */
function UsersTab({ users, loading }: { users: AdminUser[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="vault-card p-4"><div className="shimmer h-12 w-full" /></div>
      ))}
    </div>
  )

  if (users.length === 0) return (
    <EmptyState
      icon={<Users className="w-10 h-10 md:w-12 md:h-12" />}
      title="No users"
      description="Users will appear here once they sign up"
      color="var(--champagne)"
    />
  )

  return (
    <div className="space-y-2">
      {users.map(user => (
        <div key={user.id} className="vault-card p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
              style={{ background: 'var(--vault-charcoal)', color: user.role === 'ADMIN' ? 'var(--champagne)' : 'var(--text-secondary)' }}
            >
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.displayName || 'Unnamed'}
                </p>
                {user.role === 'ADMIN' && (
                  <span className="vault-badge vault-badge-champagne flex-shrink-0">Admin</span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <div className="flex-shrink-0">
              {user.isActive ? (
                <span className="vault-badge vault-badge-success">Active</span>
              ) : (
                <span className="vault-badge vault-badge-error">Disabled</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Draws Tab ──────────────────────────────────────────── */
function DrawsTab({ draws, loading, processingId, onExecute, onOpen }: {
  draws: AdminDraw[]; loading: boolean; processingId: string | null
  onExecute: (id: string) => void; onOpen: (id: string) => void
}) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="vault-card p-4 md:p-5"><div className="shimmer h-20 w-full" /></div>
      ))}
    </div>
  )

  if (draws.length === 0) return (
    <EmptyState
      icon={<Activity className="w-10 h-10 md:w-12 md:h-12" />}
      title="No draws yet"
      description="Create your first lucky draw to get started"
      color="var(--emerald)"
    />
  )

  return (
    <div className="space-y-3">
      {draws.map(draw => {
        const isProcessing = processingId === draw.id
        return (
          <div key={draw.id} className="vault-card p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm md:text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {draw.title}
                  </p>
                  <StatusBadge status={draw.status} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--text-disabled)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Price:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>${Number(draw.ticketPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-disabled)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Sold:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{draw.soldTickets}/{draw.maxTickets}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--text-disabled)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Pool:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>${(Number(draw.ticketPrice) * draw.soldTickets).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-disabled)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{new Date(draw.scheduledAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                {draw.status === 'UPCOMING' && (
                  <button
                    onClick={() => onOpen(draw.id)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: 'var(--emerald)', color: '#fff', opacity: isProcessing ? 0.5 : 1 }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Open
                  </button>
                )}
                {draw.status === 'OPEN' && draw.soldTickets > 0 && (
                  <button
                    onClick={() => onExecute(draw.id)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: 'var(--champagne)', color: 'var(--vault-black)', opacity: isProcessing ? 0.5 : 1 }}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Execute
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Activity Tab ────────────────────────────────────────── */
function ActivityTab({ loading }: { loading: boolean }) {
  const [logs, setLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    api.getAuditLogs(1, 30).then(result => {
      if (result.data?.logs) setLogs(result.data.logs)
      else if (Array.isArray(result.data)) setLogs(result.data)
    }).catch(() => {}).finally(() => setLogsLoading(false))
  }, [])

  const isLoading = loading || logsLoading

  if (isLoading) return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="vault-card p-4"><div className="shimmer h-12 w-full" /></div>
      ))}
    </div>
  )

  if (logs.length === 0) return (
    <EmptyState
      icon={<Eye className="w-10 h-10 md:w-12 md:h-12" />}
      title="No activity yet"
      description="Audit logs will appear here"
      color="var(--text-muted)"
    />
  )

  return (
    <div className="space-y-2">
      {logs.map((log: any, i: number) => (
        <div key={log.id || i} className="vault-card p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'var(--vault-charcoal)', color: 'var(--text-muted)' }}
            >
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {log.description || log.action || 'System event'}
              </p>
              <p className="text-[11px] md:text-xs mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                {log.user?.email ? ` · ${log.user.email}` : ''}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Shared Components ───────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    OPEN: { class: 'vault-badge-success', label: 'Open' },
    UPCOMING: { class: 'vault-badge-warning', label: 'Upcoming' },
    COMPLETED: { class: 'vault-badge-muted', label: 'Completed' },
    DRAWN: { class: 'vault-badge-champagne', label: 'Drawn' },
  }
  const { class: cls, label } = config[status] || { class: 'vault-badge-muted', label: status }
  return <span className={`vault-badge ${cls} flex-shrink-0`}>{label}</span>
}

function EmptyState({ icon, title, description, color }: {
  icon: React.ReactNode; title: string; description: string; color: string
}) {
  return (
    <div className="vault-card p-10 md:p-14 text-center">
      <div className="mx-auto mb-4" style={{ color }}>{icon}</div>
      <p className="text-base md:text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  )
}
