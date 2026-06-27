import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Wallet, Draw } from '@/types'
import {
  Wallet as WalletIcon,
  Ticket,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [activeDraws, setActiveDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getBalance(),
      api.getActiveDraws(),
    ]).then(([walletRes, drawsRes]) => {
      if (walletRes.success) setWallet(walletRes.data)
      if (drawsRes.success) setActiveDraws(drawsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 shimmer rounded-3xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Balance Card */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(45 100% 50% / 0.6) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(120 54% 24% / 0.5) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Total Balance</p>
          <h2 className="text-4xl md:text-5xl font-black text-gold gold-glow">
            {formatCurrency(wallet?.balance ?? 0)}
          </h2>
          <button
            onClick={() => navigate('/wallet')}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 btn-gold text-sm"
          >
            <WalletIcon className="w-4 h-4" />
            Top Up
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Ticket, label: 'Active Draws', value: activeDraws.length.toString(), color: 'text-gold' },
          { icon: TrendingUp, label: 'Win Rate', value: '—', color: 'text-green-400' },
          { icon: Users, label: 'Players', value: '—', color: 'text-blue-400' },
          { icon: Clock, label: 'Next Draw', value: activeDraws[0]?.title ?? 'None', color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-xl font-bold text-white truncate">{stat.value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Draws */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Active Draws</h3>
          <button
            onClick={() => navigate('/draws')}
            className="text-xs text-gold/70 hover:text-gold transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {activeDraws.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Ticket className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No active draws available</p>
            </div>
          ) : (
            activeDraws.map((draw) => (
              <div
                key={draw.id}
                className="glass-card p-5 hover:border-gold/20 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/draws/${draw.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-white">{draw.title}</h4>
                  <span className="px-2.5 py-1 bg-gold/10 text-gold text-[10px] font-medium rounded-full border border-gold/20">
                    {draw.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-base font-bold text-gold">{formatCurrency(draw.prizePool)}</p>
                    <p className="text-[10px] text-white/30">Prize Pool</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
                    <p className="text-[10px] text-white/30">Per Ticket</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-white">{draw.soldTickets}/{draw.maxTickets}</p>
                    <p className="text-[10px] text-white/30">Sold</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/draws/${draw.id}/buy`) }}
                    disabled={draw.status !== 'OPEN' || draw.soldTickets >= draw.maxTickets}
                    className="flex-1 py-2 btn-gold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Buy Ticket
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/draws/${draw.id}`) }}
                    className="flex-1 py-2 glass-card text-white/60 text-xs font-medium hover:text-white transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
