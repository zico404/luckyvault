import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { api, User, Wallet as WalletType } from '@/lib/api'
import { User as UserIcon, Mail, Wallet, Badge, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getProfile(),
      api.getBalance(),
    ]).then(([profRes, balRes]) => {
      setUser(profRes.data)
      setWallet(balRes.data)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-[480px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          Profile
        </h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'var(--vault-charcoal)' }}
        >
          <span className="text-2xl font-semibold" style={{ color: 'var(--champagne)' }}>
            {(user?.displayName || user?.email || '?')[0].toUpperCase()}
          </span>
        </div>
        <h2 className="text-lg font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
          {user?.displayName || 'User'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {user?.email || authUser?.email}
        </p>
      </div>

      {/* Info card */}
      <div className="vault-card p-5 space-y-0">
        <ProfileRow icon={<UserIcon className="w-4 h-4" />} label="Name" value={user?.displayName || 'Not set'} />
        <Divider />
        <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email || 'Not set'} />
        <Divider />
        <ProfileRow icon={<Wallet className="w-4 h-4" />} label="Balance" value={`$${Number(wallet?.balance || 0).toFixed(2)}`} />
        <Divider />
        <ProfileRow icon={<Badge className="w-4 h-4" />} label="Role" value={user?.role || 'USER'} />
      </div>

      {/* Sign out */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full h-11 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        style={{
          background: 'transparent',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          color: 'var(--crimson)',
        }}
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>

      {/* Logout confirmation */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="vault-card p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sign out</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleLogout}
                className="flex-1 h-10 rounded-lg text-sm font-medium"
                style={{ background: 'var(--crimson)', color: 'white' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <div className="flex-1">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'var(--vault-subtle)' }} />
}
