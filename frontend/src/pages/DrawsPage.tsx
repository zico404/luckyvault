import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Draw } from '@/types'
import { Ticket, Search } from 'lucide-react'

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search draws..."
            className="pl-9 pr-4 py-2 glass-input text-sm text-white placeholder:text-white/20 focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 glass-card w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            tab === 'active' ? 'btn-gold' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            tab === 'completed' ? 'btn-gold' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Completed
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Ticket className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No draws found</p>
          </div>
        ) : (
          filtered.map((draw) => (
            <Link
              key={draw.id}
              to={`/draws/${draw.id}`}
              className="block glass-card p-5 hover:border-gold/20 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white group-hover:text-gold transition-colors">
                  {draw.title}
                </h3>
                <span className={`px-2.5 py-1 text-[10px] font-medium rounded-full border ${
                  draw.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  draw.status === 'COMPLETED' ? 'bg-primary/10 text-primary-400 border-primary/20' :
                  'bg-gold/10 text-gold border-gold/20'
                }`}>
                  {draw.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-sm font-bold text-gold">{formatCurrency(draw.prizePool)}</p>
                  <p className="text-[10px] text-white/30">Prize Pool</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
                  <p className="text-[10px] text-white/30">Price</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{draw.soldTickets}/{draw.maxTickets}</p>
                  <p className="text-[10px] text-white/30">Sold</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{formatDate(draw.scheduledAt)}</p>
                  <p className="text-[10px] text-white/30">Date</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
