import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { DrawDetail as DrawDetailType } from '@/types'
import {
  ArrowLeft,
  Clock,
  Ticket,
  Trophy,
  Medal,
  Award,
} from 'lucide-react'

export function DrawDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [draw, setDraw] = useState<DrawDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      api.getDraw(id).then((res) => {
        if (res.success) setDraw(res.data)
      }).finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 shimmer rounded-3xl" />
        <div className="h-24 shimmer rounded-3xl" />
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

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-gold" />
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />
    if (rank === 3) return <Award className="w-8 h-8 text-amber-600" />
    return <Award className="w-8 h-8 text-muted-foreground" />
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
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
        <h1 className="text-3xl font-bold text-white mb-2">{draw.title}</h1>
        {draw.description && (
          <p className="text-muted-foreground mb-4">{draw.description}</p>
        )}
        <p className="text-sm text-muted-foreground mb-2">PRIZE POOL</p>
        <p className="text-5xl font-black text-gold">{formatCurrency(draw.prizePool)}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Price', value: formatCurrency(draw.ticketPrice) },
          { label: 'Winners', value: draw.winnerCount.toString() },
          { label: 'Status', value: draw.status },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-4 text-center border border-border">
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
        {[
          { label: 'Sold', value: draw.soldTickets.toString() },
          { label: 'Max', value: draw.maxTickets.toString() },
          { label: 'Remaining', value: (draw.maxTickets - draw.soldTickets).toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-4 text-center border border-border">
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
        <Clock className="w-5 h-5 text-gold" />
        <div>
          <p className="text-xs text-muted-foreground">Draw Time</p>
          <p className="text-white font-medium">{formatDateTime(draw.scheduledAt)}</p>
        </div>
      </div>

      {draw.status === 'COMPLETED' && draw.winners.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Winners</h3>
          <div className="space-y-3">
            {draw.winners.map((winner) => (
              <div key={winner.ticketId} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rankIcon(winner.rank)}
                  <div>
                    <p className="text-white font-semibold">#{winner.rank} Winner</p>
                    <p className="text-xs text-muted-foreground">Ticket: {winner.ticketId.slice(0, 8)}...</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-400">+{formatCurrency(winner.prize)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {draw.status === 'OPEN' && draw.soldTickets < draw.maxTickets && (
        <button
          onClick={() => navigate(`/draws/${draw.id}/buy`)}
          className="w-full py-4 bg-gold text-surface font-bold rounded-2xl hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-5 h-5" />
          Buy Ticket — {formatCurrency(draw.ticketPrice)}
        </button>
      )}
    </div>
  )
}
