import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Draw } from '@/lib/api'
import { Ticket, ArrowRight, Clock, Users, DollarSign } from 'lucide-react'

export function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getActiveDraws().then((res) => {
      setDraws(res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          Active draws
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Browse available draws and purchase tickets
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vault-card p-6">
              <div className="shimmer h-5 w-48 mb-3" />
              <div className="shimmer h-4 w-32 mb-4" />
              <div className="shimmer h-10 w-full" />
            </div>
          ))}
        </div>
      ) : draws.length === 0 ? (
        <div className="vault-card p-12 text-center">
          <Ticket className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No active draws</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back soon for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </div>
  )
}

function DrawCard({ draw }: { draw: Draw }) {
  const statusColor = draw.status === 'OPEN' ? 'var(--emerald)' : draw.status === 'UPCOMING' ? 'var(--amber)' : 'var(--text-muted)'
  const statusBg = draw.status === 'OPEN' ? 'rgba(5, 150, 105, 0.1)' : draw.status === 'UPCOMING' ? 'rgba(217, 119, 6, 0.1)' : 'var(--vault-charcoal)'

  return (
    <div className="vault-card overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{draw.title}</h3>
          <span
            className="vault-badge"
            style={{ background: statusBg, color: statusColor }}
          >
            {draw.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Prize pool</p>
            <p className="text-lg font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
              ${Number(draw.prizePool).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ticket price</p>
            <p className="text-lg font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
              ${Number(draw.ticketPrice).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available</p>
            <p className="text-lg font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {draw.maxTickets - draw.soldTickets}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/draws/${draw.id}/buy`}
            className="btn-primary flex-1 text-center"
          >
            Buy ticket
          </Link>
          <Link
            to={`/draws/${draw.id}`}
            className="btn-secondary flex-1 text-center"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}
