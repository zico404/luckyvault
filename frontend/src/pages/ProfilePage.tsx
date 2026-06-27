import { useAuth } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import type { Wallet } from '@/types'
import { User, Mail, Wallet as WalletIcon, BadgeCheck, LogOut, X } from 'lucide-react'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    api.getBalance().then((res) => {
      if (res.success) setWallet(res.data)
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const infoItems = [
    { icon: User, label: 'Name', value: user?.displayName || 'Not set' },
    { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
    { icon: WalletIcon, label: 'Balance', value: formatCurrency(wallet?.balance ?? 0) },
    { icon: BadgeCheck, label: 'Role', value: user?.role || 'USER' },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar */}
      <div className="glass-card p-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ background: 'radial-gradient(circle, hsl(45 100% 50% / 0.5) 0%, transparent 70%)' }} />
          <div className="w-20 h-20 glass-card rounded-full flex items-center justify-center relative z-10">
            <span className="text-2xl font-black text-gold">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold text-white">{user?.displayName || 'User'}</h2>
        <p className="text-xs text-white/30">{user?.email}</p>
      </div>

      {/* Info */}
      <div className="space-y-2">
        {infoItems.map((item) => (
          <div key={item.label} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-gold" />
              <span className="text-xs text-white/40">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-3.5 glass-card text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="glass-card p-6 max-w-sm w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Sign Out</h3>
              <button onClick={() => setShowLogoutConfirm(false)} className="text-white/30 hover:text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 glass-card text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-destructive text-white text-sm font-medium rounded-2xl hover:bg-destructive/90 transition-colors"
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
