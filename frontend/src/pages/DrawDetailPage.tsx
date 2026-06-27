import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, DrawDetail } from '@/lib/api'
import { ArrowLeft, Trophy, Users, Clock } from 'lucide-react'

export function DrawDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [draw, setDraw] = useState<DrawDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      api.getDraw(id).then((res) => {
        setDraw(res.data)
        setLoading(false)
      }).catch((e) => {
        setError(e?.message || 'Failed to load draw')
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="shimmer h-8 w-48" />
        <div className="vault-card p-6"><div className="shimmer h-40 w-full" /></div>
        <div className="vault-card p-5"><div className="shimmer h-24 w-full" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="vault-card p-12 text-center">
          <p style={{ color: 'var(--crimson)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="vault-card p-12 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>Draw not found</p>
        </div>
      </div>
    )
  }

  const prizePool = Number(draw.prizePool) || 0
  const ticketPrice = Number(draw.ticketPrice) || 0
  const remaining = (Number(draw.maxTickets) || 0) - (Number(draw.soldTickets) || 0)
  const winners = draw.winners || []

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header card */}
      <div className="vault-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{draw.title}</h1>
          <span className="vault-badge vault-badge-success">{draw.status}</span>
        </div>
        {draw.description && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{draw.description}</p>
        )}
        <p className="text-3xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          ${prizePool.toFixed(2)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Prize pool</p>
      </div>

      {/* Stats */}
      <div className="vault-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ticket price</p>
            <p className="text-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>${ticketPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sold</p>
            <p className="text-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{draw.soldTickets}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining</p>
            <p className="text-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{remaining}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Winners</p>
            <p className="text-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{draw.winnerCount}</p>
          </div>
        </div>
      </div>

      {/* Draw info */}
      <div className="vault-card p-5">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Draw information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-3.5 h-3.5" /> Scheduled time
            </span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{new Date(draw.scheduledAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-3.5 h-3.5" /> Tickets sold
            </span>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{draw.soldTickets} / {draw.maxTickets}</span>
          </div>
        </div>
      </div>

      {/* Winners */}
      {winners.length > 0 && (
        <div className="vault-card p-5">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Trophy className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
            Winners
          </h3>
          <div className="space-y-2">
            {winners.map((w, i) => {
              const prize = Number(w.prize || w.prizeAmount) || 0
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--vault-charcoal)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--champagne)' }}>#{w.rank}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{w.ticketId.slice(0, 8)}...</span>
                  </div>
                  {prize > 0 && (
                    <span className="text-sm font-medium" style={{ color: 'var(--emerald)' }}>${prize.toFixed(2)}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Buy button */}
      {draw.status === 'OPEN' && (
        <Link to={`/draws/${draw.id}/buy`} className="btn-primary w-full h-12 text-center block">
          Buy ticket for ${ticketPrice.toFixed(2)}
        </Link>
      )}
    </div>
  )
}
