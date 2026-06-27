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

function VaultLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 108 108" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="54" cy="54" r="42" fill="#C9A84C"/>
      <circle cx="54" cy="54" r="38" fill="#0D1B0E"/>
      <circle cx="54" cy="54" r="35" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="54" cy="54" r="12" fill="#C9A84C"/>
      <circle cx="54" cy="54" r="5" fill="#A08A3C"/>
      <line x1="54" y1="43" x2="54" y2="65" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="54" cy="43" r="3" fill="#FFD700"/>
      <circle cx="54" cy="65" r="3" fill="#FFD700"/>
    </svg>
  )
}

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
          <VaultLogo className="w-10 h-10" />
          <div>
            <span className="text-xl font-black text-gold">LUCKY</span>
            <span className="text-xl font-black text-white/90"> VAULT</span>
          </div>
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
            <VaultLogo className="w-8 h-8" />
            <span className="text-lg font-black">
              <span className="text-gold">LUCKY</span>{' '}
              <span className="text-white/90">VAULT</span>
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
