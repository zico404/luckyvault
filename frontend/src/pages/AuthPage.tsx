import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { VaultMark } from '@/components/VaultLogo'

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
      if (success) navigate('/')
      else setError('Authentication failed. Please check your credentials.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vault-black)' }}>
      <div className="w-full max-w-[400px] animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <VaultMark size={56} />
          <h1
            className="mt-6 text-lg font-semibold tracking-[4px]"
            style={{ color: 'var(--text-primary)' }}
          >
            LUCKY VAULT
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <div className="vault-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vault-input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Display name (signup) */}
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Display name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="vault-input pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vault-input pl-10 pr-11"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm text-center animate-fade-in"
                style={{ background: 'rgba(220, 38, 38, 0.08)', color: 'var(--crimson)', border: '1px solid rgba(220, 38, 38, 0.15)' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || password.length < 8}
              className="btn-primary w-full h-12 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--vault-subtle), transparent)' }} />

          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {isLogin ? (
                <>New here? <span style={{ color: 'var(--champagne)' }}>Create an account</span></>
              ) : (
                <>Already have an account? <span style={{ color: 'var(--champagne)' }}>Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-disabled)' }}>
          Your fortune, secured.
        </p>
      </div>
    </div>
  )
}
