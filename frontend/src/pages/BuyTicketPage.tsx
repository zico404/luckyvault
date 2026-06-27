import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Draw } from '@/lib/api'
import { useToast } from '@/components/Toast'
import { ArrowLeft, DollarSign, AlertCircle } from 'lucide-react'

export function BuyTicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [draw, setDraw] = useState<Draw | null>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getDraw(id),
        api.getBalance(),
      ]).then(([drawRes, balRes]) => {
        setDraw(drawRes.data)
        setBalance(balRes.data.balance || 0)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [id])

  const handlePurchase = async () => {
    if (!id) return
    setPurchasing(true)
    try {
      await api.purchaseTicket(id)
      navigate('/tickets')
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to purchase ticket'
      toast(msg, 'error')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return <div className="vault-card p-6"><div className="shimmer h-40 w-full" /></div>
  }

  if (!draw) {
    return <div className="vault-card p-12 text-center"><p style={{ color: 'var(--text-secondary)' }}>Draw not found</p></div>
  }

  const canAfford = balance >= draw.ticketPrice

  return (
    <div className="space-y-6 animate-fade-in max-w-[480px] mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Purchase ticket</h1>

      {/* Draw summary */}
      <div className="vault-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{draw.title}</h3>
          <span className="vault-badge vault-badge-success">{draw.status}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg" style={{ background: 'var(--vault-charcoal)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Prize</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${draw.prizePool.toFixed(0)}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--vault-charcoal)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Price</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${draw.ticketPrice.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--vault-charcoal)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Left</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{draw.maxTickets - draw.soldTickets}</p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="vault-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your balance</p>
          <p className="text-lg font-medium" style={{ color: canAfford ? 'var(--text-primary)' : 'var(--crimson)' }}>
            ${balance.toFixed(2)}
          </p>
        </div>
        {!canAfford && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--crimson)' }}>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Insufficient balance</span>
          </div>
        )}
      </div>

      {/* Purchase button */}
      <button
        onClick={handlePurchase}
        disabled={purchasing || !canAfford || draw.status !== 'OPEN'}
        className="btn-primary w-full h-12"
      >
        {purchasing ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          `Purchase ticket — $${draw.ticketPrice.toFixed(2)}`
        )}
      </button>
    </div>
  )
}
