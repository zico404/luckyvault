import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { api } from '@/lib/api'
import { Shield, CheckCircle, XCircle, Clock, DollarSign, Users, Activity } from 'lucide-react'

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

interface DashboardStats {
  totalUsers: number
  activeDraws: number
  pendingTopUps: number
}

export function AdminPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'topups' | 'users' | 'draws'>('topups')
  const [pendingTopUps, setPendingTopUps] = useState<PendingTopUp[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, activeDraws: 0, pendingTopUps: 0 })
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingTopUps()
  }, [])

  const fetchPendingTopUps = async () => {
    setLoading(true)
    try {
      const result = await api.getPendingTopUps()
      if (result.data) {
        setPendingTopUps(result.data)
        setStats(prev => ({ ...prev, pendingTopUps: result.data.length }))
      }
    } catch {
      toast('Failed to load pending top-ups', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await api.approveTopUp(id)
      setPendingTopUps(prev => prev.filter(t => t.id !== id))
      toast('Top-up approved successfully', 'success')
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
      toast('Top-up rejected', 'success')
    } catch {
      toast('Failed to reject top-up', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--vault-black)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'var(--vault-graphite)', borderBottom: '1px solid var(--vault-subtle)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" style={{ color: 'var(--champagne)' }} />
            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--vault-charcoal)', color: 'var(--text-secondary)' }}>
              Lucky Vault Admin
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={stats.totalUsers.toString()}
            color="var(--champagne)"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Active Draws"
            value={stats.activeDraws.toString()}
            color="var(--emerald)"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Top-ups"
            value={stats.pendingTopUps.toString()}
            color="var(--amber)"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--vault-graphite)' }}>
          {(['topups', 'users', 'draws'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab ? 'var(--vault-charcoal)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {tab === 'topups' ? 'Pending Top-ups' : tab === 'users' ? 'Users' : 'Draws'}
            </button>
          ))}
        </div>

        {/* Top-ups tab */}
        {activeTab === 'topups' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                Loading...
              </div>
            ) : pendingTopUps.length === 0 ? (
              <div className="vault-card p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--emerald)' }} />
                <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>No pending top-ups to review</p>
              </div>
            ) : (
              pendingTopUps.map(topUp => (
                <div key={topUp.id} className="vault-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--amber)' }}>
                        <DollarSign className="w-5 h-5" style={{ color: 'var(--vault-black)' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${Number(topUp.amount).toFixed(2)} top-up
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {topUp.user?.email || 'Unknown'} · {topUp.paymentMethod} · {new Date(topUp.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(topUp.id)}
                        disabled={processingId === topUp.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: 'var(--vault-charcoal)',
                          color: 'var(--text-secondary)',
                          opacity: processingId === topUp.id ? 0.5 : 1,
                        }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(topUp.id)}
                        disabled={processingId === topUp.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: 'var(--emerald)',
                          color: 'var(--vault-black)',
                          opacity: processingId === topUp.id ? 0.5 : 1,
                        }}
                      >
                        {processingId === topUp.id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users / Draws tabs (placeholder) */}
        {activeTab !== 'topups' && (
          <div className="vault-card p-12 text-center">
            <p style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'users' ? 'User management coming soon' : 'Draw management coming soon'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="vault-card p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      </div>
    </div>
  )
}
