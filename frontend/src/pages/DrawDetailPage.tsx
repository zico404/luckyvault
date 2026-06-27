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
        <p className="text-white/40">Draw not found</p>
        <button onClick={() => navigate('/draws')} className="mt-4 text-gold hover:underline text-sm">
          Back to Draws
        </button>
      </div>
    )
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-gold" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
    return <Award className="w-6 h-6 text-white/30" />
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'linear-gradient(180deg, hsl(120 54% 24% / 0.4) 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2">{draw.title}</h1>
          {draw.description && (
            <p className="text-white/40 mb-4 text-sm">{draw.description}</p>
          )}
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Prize Pool</p>
          <p className="text-4xl font-black text-gold gold-glow">{formatCurrency(draw.prizePool)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Price', value: formatCurrency(draw.ticketPrice) },
          { label: 'Winners', value: draw.winnerCount.toString() },
          { label: 'Status', value: draw.status },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <p className="text-sm font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
          </div>
        ))}
        {[
          { label: 'Sold', value: draw.soldTickets.toString() },
          { label: 'Max', value: draw.maxTickets.toString() },
          { label: 'Left', value: (draw.maxTickets - draw.soldTickets).toString() },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <p className="text-sm font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex items-center gap-3">
        <Clock className="w-4 h-4 text-gold" />
        <div>
          <p className="text-[10px] text-white/30">Draw Time</p>
          <p className="text-white/80 text-sm font-medium">{formatDateTime(draw.scheduledAt)}</p>
        </div>
      </div>

      {draw.status === 'COMPLETED' && draw.winners.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Winners</h3>
          <div className="space-y-2">
            {draw.winners.map((winner) => (
              <div key={winner.ticketId} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rankIcon(winner.rank)}
                  <div>
                    <p className="text-white/80 font-semibold text-sm">#{winner.rank} Winner</p>
                    <p className="text-[10px] text-white/30">Ticket: {winner.ticketId.slice(0, 8)}...</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-400">+{formatCurrency(winner.prize)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {draw.status === 'OPEN' && draw.soldTickets < draw.maxTickets && (
        <button
          onClick={() => navigate(`/draws/${draw.id}/buy`)}
          className="w-full py-4 btn-gold flex items-center justify-center gap-2 text-sm"
        >
          <Ticket className="w-4 h-4" />
          Buy Ticket — {formatCurrency(draw.ticketPrice)}
        </button>
      )}
    </div>
  )
}
