import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { VaultMark } from '@/components/VaultLogo'
import { LayoutDashboard, Ticket, Wallet, Bell, User, ArrowRight, TrendingUp, Clock, Trophy } from 'lucide-react'

interface DashboardStats {
  balance: number
  activeDraws: number
  totalTickets: number
  recentWins: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats] = useState<DashboardStats>({
    balance: 0,
    activeDraws: 3,
    totalTickets: 12,
    recentWins: 2,
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Here's your account overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Balance"
          value={`$${stats.balance.toFixed(2)}`}
          href="/wallet"
        />
        <StatCard
          icon={<Ticket className="w-5 h-5" />}
          label="Active draws"
          value={stats.activeDraws.toString()}
          href="/draws"
        />
        <StatCard
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Total tickets"
          value={stats.totalTickets.toString()}
          href="/tickets"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Recent wins"
          value={stats.recentWins.toString()}
          href="/tickets"
          accent
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction
            icon={<Ticket className="w-5 h-5" />}
            title="Buy ticket"
            description="Enter an active draw"
            href="/draws"
          />
          <QuickAction
            icon={<Wallet className="w-5 h-5" />}
            title="Top up wallet"
            description="Add funds to your account"
            href="/wallet"
          />
          <QuickAction
            icon={<Bell className="w-5 h-5" />}
            title="Notifications"
            description="Check recent alerts"
            href="/notifications"
          />
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Recent activity
        </h2>
        <div className="vault-card p-8 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No recent activity. Buy a ticket to get started.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, href, accent }: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  accent?: boolean
}) {
  return (
    <Link to={href} className="vault-card p-5 block group hover:border-[rgba(201,169,98,0.15)] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: accent ? 'rgba(5, 150, 105, 0.1)' : 'var(--champagne-subtle)' }}
        >
          <span style={{ color: accent ? 'var(--emerald)' : 'var(--champagne)' }}>{icon}</span>
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-2xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </Link>
  )
}

function QuickAction({ icon, title, description, href }: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="vault-card p-5 flex items-center gap-4 group hover:border-[rgba(201,169,98,0.15)] transition-all duration-200"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'var(--champagne-subtle)' }}
      >
        <span style={{ color: 'var(--champagne)' }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
    </Link>
  )
}
