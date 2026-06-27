import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useToast } from '@/components/Toast'
import { ArrowLeft, Wallet, CreditCard, CheckCircle } from 'lucide-react'

const AMOUNTS = [5, 10, 25, 50, 100, 250]

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'apple_pay', label: 'Apple Pay', icon: Wallet },
  { id: 'google_pay', label: 'Google Pay', icon: Wallet },
]

export function TopUpPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const finalAmount = amount || parseFloat(customAmount) || 0

  const handleTopUp = async () => {
    if (finalAmount <= 0 || finalAmount > 10000) {
      toast('Please enter an amount between $1 and $10,000', 'error')
      return
    }
    setLoading(true)
    try {
      await api.topUp(finalAmount, paymentMethod)
      setSuccess(true)
      toast(`Successfully added $${finalAmount.toFixed(2)} to your wallet`)
    } catch (err: any) {
      const msg = err.message || 'Top-up failed. Please try again.'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.1)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--emerald)' }} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Top-up successful</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              ${finalAmount.toFixed(2)} has been added to your wallet
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/wallet')} className="btn-primary">
              View wallet
            </button>
            <button onClick={() => { setSuccess(false); setAmount(null); setCustomAmount('') }} className="btn-secondary">
              Top up more
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/wallet')} className="p-2 rounded-lg transition-colors hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
            Top up wallet
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Add funds to your account
          </p>
        </div>
      </div>

      {/* Amount selection */}
      <div className="vault-card p-6">
        <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Select amount</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustomAmount('') }}
              className="py-3 rounded-xl text-center font-medium transition-all duration-200"
              style={{
                background: amount === a ? 'var(--champagne)' : 'var(--vault-charcoal)',
                color: amount === a ? 'var(--vault-black)' : 'var(--text-secondary)',
                border: `1px solid ${amount === a ? 'var(--champagne)' : 'var(--vault-subtle)'}`,
              }}
            >
              ${a}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{ color: 'var(--text-muted)' }}>$</span>
          <input
            type="number"
            min="1"
            max="10000"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(null) }}
            placeholder="Custom amount"
            className="vault-input pl-8 text-lg font-medium"
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="vault-card p-6">
        <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Payment method</p>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((pm) => {
            const Icon = pm.icon
            return (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: paymentMethod === pm.id ? 'rgba(201,169,98,0.08)' : 'var(--vault-charcoal)',
                  border: `1px solid ${paymentMethod === pm.id ? 'rgba(201,169,98,0.3)' : 'var(--vault-subtle)'}`,
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--vault-elevated)' }}>
                  <Icon className="w-4 h-4" style={{ color: paymentMethod === pm.id ? 'var(--champagne)' : 'var(--text-muted)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pm.label}</span>
                {paymentMethod === pm.id && (
                  <div className="ml-auto w-2 h-2 rounded-full" style={{ background: 'var(--champagne)' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleTopUp}
        disabled={loading || finalAmount <= 0 || finalAmount > 10000}
        className="btn-primary w-full h-12"
        style={loading ? { pointerEvents: 'auto', opacity: 0.8 } : undefined}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          `Top up $${finalAmount > 0 ? finalAmount.toFixed(2) : '0.00'}`
        )}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--text-disabled)' }}>
        Top-up is instant. Maximum single top-up is $10,000.
      </p>
    </div>
  )
}
