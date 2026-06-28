import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/Toast'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { VaultMark } from '@/components/VaultLogo'

const API_BASE = import.meta.env.VITE_API_URL || 'https://lucky-vault-backend-production.up.railway.app'
const APK_DIRECT_URL = 'https://raw.githubusercontent.com/zico404/luckyvault/main/apks/LuckyVault-debug.apk'

export function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/download/version`)
      .then(r => r.json())
      .then(data => setAppVersion(data.version || ''))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, displayName || undefined)
      if (result.success) {
        toast(isLogin ? 'Welcome back!' : 'Account created successfully')
        navigate('/')
      } else {
        toast(result.error || 'Authentication failed. Please check your credentials.', 'error')
      }
    } catch (err: any) {
      toast(err.message || 'An error occurred. Please try again.', 'error')
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || password.length < 8}
              className="btn-primary w-full h-12 mt-2"
              style={loading ? { pointerEvents: 'auto', opacity: 0.8 } : undefined}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--vault-subtle), transparent)' }} />

          {/* Toggle */}
          <div className="text-center mb-6">
            <button
              onClick={() => { setIsLogin(!isLogin) }}
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

          {/* Download APK */}
          <a
            href={APK_DIRECT_URL}
            download="LuckyVault.apk"
            className="flex items-center justify-center gap-3 w-full h-12 rounded-xl transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: '#000',
              border: '1px solid #5F6368',
              color: '#fff',
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4"/>
              <path d="M16.296 15.504L13.792 12l2.504-3.504 4.256 2.44a1 1 0 010 1.732l-4.256 1.836z" fill="#34A853"/>
              <path d="M16.296 8.496L13.792 12l-10.183 9.814 12.687-13.318z" fill="#EA4335"/>
              <path d="M20.552 12.712l-4.256-2.44L13.792 12l2.504 3.504 4.256-1.792a1 1 0 000-1.836l-.004-.164z" fill="#FBBC04"/>
              <path d="M3.61 1.814L13.792 12l2.504-3.504L3.609.894a1 1 0 00-.61-.08z" fill="#EA4335"/>
            </svg>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-normal" style={{ color: '#aaa' }}>GET IT ON</span>
              <span className="text-sm font-semibold" style={{ color: '#fff' }}>Google Play {appVersion && <span className="text-[10px] font-normal opacity-60">v{appVersion}</span>}</span>
            </div>
          </a>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-disabled)' }}>
          Your fortune, secured.
        </p>
      </div>
    </div>
  )
}
