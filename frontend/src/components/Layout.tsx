import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard,
  Ticket,
  Wallet,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4">
        <Link to="/" className="flex items-center gap-3 px-4 py-6 mb-8">
          <Sparkles className="w-8 h-8 text-gold" />
          <div>
            <span className="text-xl font-black text-gold">LUCKY</span>
            <span className="text-xl font-black text-white"> VAULT</span>
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
                  'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all',
                  isActive
                    ? 'bg-primary/20 text-gold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors rounded-2xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-card border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            <span className="text-lg font-black">
              <span className="text-gold">LUCKY</span>{' '}
              <span className="text-white">VAULT</span>
            </span>
          </Link>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors min-w-[48px]',
                  isActive
                    ? 'text-gold'
                    : 'text-muted-foreground'
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
