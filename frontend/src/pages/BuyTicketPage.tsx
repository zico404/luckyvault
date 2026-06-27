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
        <div className="h-14 shimmer rounded-3xl" />
      </div>
    )
  }

  if (purchasedTicket) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-fade-in">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        <h2 className="text-3xl font-bold text-white">Ticket Purchased!</h2>
        <p className="text-muted-foreground">Your unique ticket code</p>

        <div className="bg-card rounded-3xl p-8 border border-border">
          <div className="bg-white rounded-2xl p-4 mb-4 inline-block">
            <QrCode className="w-40 h-40 text-black" />
          </div>
          <p className="text-xs text-muted-foreground mb-2">Ticket Code</p>
          <p className="text-2xl font-bold text-gold tracking-widest">{purchasedTicket.ticketCode}</p>
        </div>

        <button
          onClick={() => navigate('/tickets')}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
        >
          View My Tickets
        </button>
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Draw not found</p>
        <button onClick={() => navigate('/draws')} className="mt-4 text-gold hover:underline">
          Back to Draws
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-card rounded-3xl p-8 border border-border text-center"
        style={{
          background: 'linear-gradient(180deg, hsl(120 54% 24% / 0.2) 0%, hsl(var(--card)) 100%)',
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">{draw.title}</h1>
        {draw.description && <p className="text-muted-foreground text-sm mb-4">{draw.description}</p>}
        <p className="text-sm text-muted-foreground mb-1">PRIZE POOL</p>
        <p className="text-4xl font-black text-gold">{formatCurrency(draw.prizePool)}</p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Winners</p>
            <p className="text-lg font-bold text-white">{draw.winnerCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-white">{draw.maxTickets - draw.soldTickets}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
        <WalletIcon className="w-6 h-6 text-gold" />
        <div>
          <p className="text-xs text-muted-foreground">Your Balance</p>
          <p className="text-lg font-bold text-white">{formatCurrency(wallet?.balance ?? 0)}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-2xl text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={purchasing || draw.status !== 'OPEN' || (wallet?.balance ?? 0) < draw.ticketPrice}
        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
          (wallet?.balance ?? 0) >= draw.ticketPrice
            ? 'bg-gold text-surface hover:bg-gold/90'
            : 'bg-destructive/50 text-white cursor-not-allowed'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {purchasing ? (
          <div className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
        ) : (wallet?.balance ?? 0) < draw.ticketPrice ? (
          'Insufficient Balance'
        ) : (
          <>
            <TicketIcon className="w-5 h-5" />
            Buy Ticket — {formatCurrency(draw.ticketPrice)}
          </>
        )}
      </button>
    </div>
  )
}
