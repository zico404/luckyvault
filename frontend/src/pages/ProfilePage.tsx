import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Wallet } from '@/types'
import {
  User,
  Mail,
  Wallet as WalletIcon,
  BadgeCheck,
  LogOut,
  AlertTriangle,
} from 'lucide-react'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    api.getBalance().then(res => {
      if (res.success) setWallet(res.data)
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const initials = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="bg-card rounded-3xl p-8 border border-border text-center"
        style={{
          background: 'linear-gradient(180deg, hsl(120 54% 24% / 0.2) 0%, hsl(var(--card)) 100%)',
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary-600 to-gold/50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>
        <h2 className="text-xl font-bold text-white">{user?.displayName || 'User'}</h2>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {[
          { icon: User, label: 'Name', value: user?.displayName || 'Not set' },
          { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
          { icon: WalletIcon, label: 'Balance', value: formatCurrency(wallet?.balance ?? 0) },
          { icon: BadgeCheck, label: 'Role', value: user?.role || 'USER' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 p-4">
            <item.icon className="w-5 h-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-4 bg-destructive/10 border border-destructive/30 text-destructive font-semibold rounded-2xl hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="bg-card rounded-3xl p-8 border border-border max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border border-border text-white font-medium rounded-2xl hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-destructive text-white font-medium rounded-2xl hover:bg-destructive/90 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
