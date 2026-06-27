import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Draw } from '@/types'
import { Ticket, ArrowRight, Search } from 'lucide-react'

export function DrawsPage() {
  const navigate = useNavigate()
  const [activeDraws, setActiveDraws] = useState<Draw[]>([])
  const [completedDraws, setCompletedDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.getActiveDraws(),
      api.getCompletedDraws(),
    ]).then(([activeRes, completedRes]) => {
      if (activeRes.success) setActiveDraws(activeRes.data)
      if (completedRes.success) setCompletedDraws(completedRes.data.draws)
    }).finally(() => setLoading(false))
  }, [])

  const draws = tab === 'active' ? activeDraws : completedDraws
  const filtered = draws.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Draws</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search draws..."
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-2xl text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-card rounded-2xl border border-border w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'active' ? 'bg-gold text-surface' : 'text-muted-foreground hover:text-white'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'completed' ? 'bg-gold text-surface' : 'text-muted-foreground hover:text-white'
          }`}
        >
          Completed
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border border-border">
            <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No draws found</p>
          </div>
        ) : (
          filtered.map((draw) => (
            <Link
              key={draw.id}
              to={`/draws/${draw.id}`}
              className="block bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
                  {draw.title}
                </h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  draw.status === 'OPEN' ? 'bg-green-500/15 text-green-400' :
                  draw.status === 'COMPLETED' ? 'bg-primary/15 text-primary-400' :
                  'bg-gold/15 text-gold'
                }`}>
                  {draw.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gold">{formatCurrency(draw.prizePool)}</p>
                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
                  <p className="text-xs text-muted-foreground">Price</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{draw.soldTickets}/{draw.maxTickets}</p>
                  <p className="text-xs text-muted-foreground">Sold</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{formatDate(draw.scheduledAt)}</p>
                  <p className="text-xs text-muted-foreground">Date</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
