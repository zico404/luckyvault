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
import { VaultLogo } from '@/components/VaultLogo'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/draws', icon: Ticket, label: 'Draws' },
  { path: '/tickets', icon: Ticket, label: 'My Tickets' },
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
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-nav p-4 border-r border-white/5">
        <Link to="/" className="flex items-center gap-3 px-4 py-6 mb-8">
          <VaultLogo size={40} />
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            LUCKY VAULT
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
                  isActive
                    ? 'glass bg-gold/10 text-gold border border-gold/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/30 hover:text-destructive transition-colors rounded-2xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 glass-nav border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <VaultLogo size={32} />
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              LUCKY VAULT
            </span>
          </Link>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/5 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[52px]',
                  isActive
                    ? 'text-gold'
                    : 'text-white/30 hover:text-white/50'
                )}
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
