import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Draw, Ticket, Wallet } from '@/types'
import {
  ArrowLeft,
  CheckCircle,
  Wallet as WalletIcon,
  Ticket as TicketIcon,
  QrCode,
} from 'lucide-react'

export function BuyTicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [draw, setDraw] = useState<Draw | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getDraw(id),
        api.getBalance(),
      ]).then(([drawRes, walletRes]) => {
        if (drawRes.success) setDraw(drawRes.data)
        if (walletRes.success) setWallet(walletRes.data)
      }).finally(() => setLoading(false))
    }
  }, [id])

  const handlePurchase = async () => {
    if (!id) return
    setPurchasing(true)
    setError('')

    const res = await api.purchaseTicket(id)
    if (res.success) {
      setPurchasedTicket(res.data)
      setWallet(prev => prev ? { ...prev, balance: prev.balance - (draw?.ticketPrice ?? 0) } : prev)
    } else {
      setError(res.message || 'Purchase failed')
    }
    setPurchasing(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 shimmer rounded-3xl" />
        <div className="h-16 shimmer rounded-3xl" />
      </div>
    )
  }

  if (purchasedTicket) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-full blur-xl opacity-40"
            style={{ background: 'radial-gradient(circle, hsl(120 54% 50% / 0.5) 0%, transparent 70%)' }} />
          <CheckCircle className="w-20 h-20 text-green-400 relative z-10 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ticket Purchased!</h2>
        <p className="text-white/40 text-sm">Your unique ticket code</p>

        <div className="glass-card p-6">
          <div className="bg-white rounded-2xl p-3 mb-4 inline-block">
            <QrCode className="w-32 h-32 text-black" />
          </div>
          <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">Ticket Code</p>
          <p className="text-xl font-bold text-gold tracking-widest">{purchasedTicket.ticketCode}</p>
        </div>

        <button
          onClick={() => navigate('/tickets')}
          className="w-full py-3.5 btn-gold text-sm"
        >
          View My Tickets
        </button>
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Draw not found</p>
        <button onClick={() => navigate('/draws')} className="mt-4 text-gold hover:underline text-sm">
          Back to Draws
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="glass-card p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'linear-gradient(180deg, hsl(120 54% 24% / 0.4) 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white mb-2">{draw.title}</h1>
          {draw.description && <p className="text-white/40 text-sm mb-3">{draw.description}</p>}
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Prize Pool</p>
          <p className="text-3xl font-black text-gold gold-glow">{formatCurrency(draw.prizePool)}</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <p className="text-xs text-white/30">Price</p>
              <p className="text-sm font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Winners</p>
              <p className="text-sm font-bold text-white">{draw.winnerCount}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Remaining</p>
              <p className="text-sm font-bold text-white">{draw.maxTickets - draw.soldTickets}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WalletIcon className="w-5 h-5 text-gold" />
          <div>
            <p className="text-[10px] text-white/30">Your Balance</p>
            <p className="text-sm font-bold text-white">{formatCurrency(wallet?.balance ?? 0)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30">Cost</p>
          <p className="text-sm font-bold text-gold">{formatCurrency(draw.ticketPrice)}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 glass-card bg-destructive/10 border-destructive/30 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={purchasing || (wallet?.balance ?? 0) < draw.ticketPrice}
        className="w-full py-4 btn-gold flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {purchasing ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <TicketIcon className="w-4 h-4" />
            Purchase Ticket
          </>
        )}
      </button>
    </div>
  )
}
