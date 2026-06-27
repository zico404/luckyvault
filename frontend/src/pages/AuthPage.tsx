import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

function VaultIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 108 108" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="54" cy="54" r="50" fill="none" stroke="#2A2A2A" strokeWidth="3"/>
      <circle cx="54" cy="54" r="42" fill="#C9A84C"/>
      <circle cx="54" cy="54" r="38" fill="#0D1B0E"/>
      <line x1="54" y1="16" x2="54" y2="23" stroke="#C9A84C" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="73" y1="21" x2="69.5" y2="27" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="87" y1="37" x2="81" y2="39.5" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="92" y1="54" x2="85" y2="54" stroke="#C9A84C" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="87" y1="71" x2="81" y2="68.5" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="73" y1="87" x2="69.5" y2="81" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="54" y1="92" x2="54" y2="85" stroke="#C9A84C" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="35" y1="87" x2="38.5" y2="81" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="21" y1="71" x2="27" y2="68.5" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="16" y1="54" x2="23" y2="54" stroke="#C9A84C" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="21" y1="37" x2="27" y2="39.5" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="35" y1="21" x2="38.5" y2="27" stroke="#8A7A3A" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="54" cy="54" r="35" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="54" cy="54" r="14" fill="none" stroke="#3A2A1A" strokeWidth="1.5"/>
      <circle cx="54" cy="54" r="12" fill="#C9A84C"/>
      <circle cx="54" cy="54" r="5" fill="#A08A3C"/>
      <line x1="54" y1="43" x2="54" y2="65" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="54" cy="43" r="3" fill="#FFD700"/>
      <circle cx="54" cy="65" r="3" fill="#FFD700"/>
    </svg>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = isLogin
        ? await login(email, password)
        : await register(email, password, displayName || undefined)

      if (success) {
        navigate('/')
      } else {
        setError('Authentication failed. Please check your credentials.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(45 100% 50% / 0.4) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(120 54% 24% / 0.4) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md glass rounded-[2rem] p-8 md:p-10 animate-slide-up relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(45 100% 50%), transparent)' }} />

        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full blur-xl opacity-40"
              style={{ background: 'radial-gradient(circle, hsl(45 100% 50% / 0.6) 0%, transparent 70%)' }} />
            <VaultIcon className="w-20 h-20 relative z-10" />
          </div>
          <h1 className="text-3xl font-black gold-glow tracking-wider">
            <span className="text-gold">LUCKY</span>
            <span className="text-white/90"> VAULT</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm tracking-wide">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 glass-input text-white placeholder:text-white/20 focus:outline-none text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 glass-input text-white placeholder:text-white/20 focus:outline-none text-sm"
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3.5 glass-input text-white placeholder:text-white/20 focus:outline-none text-sm"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 glass-card bg-destructive/10 border-destructive/30 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 btn-gold text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="premium-divider my-6" />

        <div className="text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-gold/70 hover:text-gold text-sm transition-colors tracking-wide"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
