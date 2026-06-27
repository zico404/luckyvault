import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { VaultLogo } from '@/components/VaultLogo'

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-bg">
      {/* Large ambient glow orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(13,27,14,0.8) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 60%)' }} />

      {/* Animated floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Outer glow ring behind card */}
        <div className="absolute -inset-1 rounded-[2.2rem] opacity-40 blur-sm pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.3) 0%, rgba(13,27,14,0.2) 50%, rgba(201,168,76,0.3) 100%)' }} />

        {/* Main glass card */}
        <div className="relative rounded-[2rem] p-8 md:p-10 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20,30,20,0.7) 0%, rgba(15,22,15,0.5) 50%, rgba(20,30,20,0.7) 100%)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            border: '1px solid rgba(201,168,76,0.15)',
            boxShadow: '0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.1), 0 0 80px rgba(201,168,76,0.05)',
          }}>

          {/* Inner glass reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-[2rem]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
            }} />

          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)' }} />

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[1px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />

          {/* Logo section */}
          <div className="text-center mb-8 relative z-10">
            <div className="relative inline-block mb-5">
              {/* Logo glow */}
              <div className="absolute inset-0 rounded-full blur-2xl opacity-50"
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%)' }} />
              <VaultLogo className="relative z-10" size={72} />
            </div>

            <h1 className="text-3xl font-black tracking-widest gold-glow">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                LUCKY VAULT
              </span>
            </h1>
            <p className="text-white/30 mt-2 text-sm tracking-wider font-light">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-gold/60 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 text-white placeholder:text-white/15 focus:outline-none text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(15,22,15,0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(201,168,76,0.1)',
                    borderRadius: '0.875rem',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08), 0 0 20px rgba(201,168,76,0.05)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Display Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-gold/60 transition-colors" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 text-white placeholder:text-white/15 focus:outline-none text-sm transition-all duration-300"
                    style={{
                      background: 'rgba(15,22,15,0.5)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(201,168,76,0.1)',
                      borderRadius: '0.875rem',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08), 0 0 20px rgba(201,168,76,0.05)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-gold/60 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 text-white placeholder:text-white/15 focus:outline-none text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(15,22,15,0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(201,168,76,0.1)',
                    borderRadius: '0.875rem',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.08), 0 0 20px rgba(201,168,76,0.05)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-center"
                style={{
                  background: 'rgba(220,38,38,0.1)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  color: 'rgb(248,113,113)',
                }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 rounded-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #F5D060 0%, #C9A84C 50%, #A08030 100%)',
                color: '#0D1B0E',
                boxShadow: '0 4px 20px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,232,138,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,232,138,0.4)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3), inset 0 1px 0 rgba(255,232,138,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)' }} />
          </div>

          <div className="text-center relative z-10">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-sm transition-colors tracking-wide"
              style={{ color: 'rgba(201,168,76,0.5)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(201,168,76,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(201,168,76,0.5)'}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
