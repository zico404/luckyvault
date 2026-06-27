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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/40 via-card to-card p-6 md:p-8 border border-border">
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gold">
            {formatCurrency(wallet?.balance ?? 0)}
          </h2>
          <button
            onClick={() => navigate('/wallet')}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-surface font-semibold rounded-2xl hover:bg-gold/90 transition-all"
          >
            <WalletIcon className="w-4 h-4" />
            Top Up Wallet
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Ticket, label: 'Active Draws', value: activeDraws.length.toString(), color: 'text-gold' },
          { icon: TrendingUp, label: 'Win Rate', value: '—', color: 'text-green-400' },
          { icon: Users, label: 'Total Players', value: '—', color: 'text-blue-400' },
          { icon: Clock, label: 'Next Draw', value: activeDraws[0]?.title ?? 'None', color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-4 border border-border">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Draws */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Active Draws</h3>
          <button
            onClick={() => navigate('/draws')}
            className="text-sm text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {activeDraws.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border">
              <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No active draws available</p>
            </div>
          ) : (
            activeDraws.map((draw) => (
              <div
                key={draw.id}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{draw.title}</h4>
                  <span className="px-3 py-1 bg-gold/15 text-gold text-xs font-medium rounded-full">
                    {draw.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gold">{formatCurrency(draw.prizePool)}</p>
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{formatCurrency(draw.ticketPrice)}</p>
                    <p className="text-xs text-muted-foreground">Per Ticket</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{draw.soldTickets}/{draw.maxTickets}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/draws/${draw.id}/buy`)}
                    disabled={draw.status !== 'OPEN' || draw.soldTickets >= draw.maxTickets}
                    className="flex-1 py-2.5 bg-gold text-surface font-semibold rounded-2xl hover:bg-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy Ticket
                  </button>
                  <button
                    onClick={() => navigate(`/draws/${draw.id}`)}
                    className="flex-1 py-2.5 border border-border text-white font-medium rounded-2xl hover:bg-muted transition-all"
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
