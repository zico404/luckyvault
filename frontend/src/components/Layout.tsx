import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard,
  Ticket,
  Wallet,
  Bell,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VaultMark } from '@/components/VaultLogo'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/draws', icon: Ticket, label: 'Draws' },
  { path: '/tickets', icon: Ticket, label: 'My tickets' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/profile', icon: User, label: 'Profile' },
]

const mobileNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/draws', icon: Ticket, label: 'Draws' },
  { path: '/tickets', icon: Ticket, label: 'Tickets' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--vault-black)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] vault-sidebar" style={{ padding: '24px 12px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 py-2 mb-8">
          <VaultMark size={28} />
          <span
            className="text-sm font-semibold tracking-[2px]"
            style={{ color: 'var(--text-primary)' }}
          >
            LUCKY VAULT
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('vault-nav-item', isActive && 'active')}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="vault-nav-item mt-auto"
          style={{ color: 'var(--text-disabled)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-2.5 px-4 py-3.5 vault-glass" style={{ borderBottom: '1px solid var(--vault-subtle)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <VaultMark size={24} />
            <span className="text-sm font-semibold tracking-[1.5px]" style={{ color: 'var(--text-primary)' }}>
              LUCKY VAULT
            </span>
          </Link>
        </header>

        <div className="p-5 md:p-8 max-w-[1100px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 vault-glass z-50" style={{ borderTop: '1px solid var(--vault-subtle)' }}>
        <div className="flex justify-around items-center h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[52px]"
                style={{ color: isActive ? 'var(--champagne)' : 'var(--text-muted)' }}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
