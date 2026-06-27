import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Transaction } from '@/lib/api'
import { useToast } from '@/components/Toast'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, ArrowRight } from 'lucide-react'

const MOCK_AMOUNTS = [10, 25, 50, 100]

export function WalletPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [mockLoading, setMockLoading] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      api.getBalance(),
      api.getTransactions(),
    ]).then(([balRes, txRes]) => {
      setBalance(Number(balRes.data.balance) || 0)
      setTransactions(txRes.data.transactions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleMockTopUp = async (amount: number) => {
    setMockLoading(amount)
    try {
      await api.topUp(amount, 'mock')
      toast(`$${amount} top-up request submitted — pending admin approval`, 'success')
    } catch (e: any) {
      toast(e?.message || 'Top-up failed', 'error')
    } finally {
      setMockLoading(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          Wallet
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Manage your balance and transactions
        </p>
      </div>

      {/* Balance card */}
      <div className="vault-card p-6" style={{ background: 'var(--vault-graphite)' }}>
        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Available balance</p>
        <p className="text-3xl font-light mt-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          ${balance.toFixed(2)}
        </p>
        <button
          onClick={() => navigate('/wallet/topup')}
          className="btn-primary mt-4"
        >
          <Plus className="w-4 h-4" /> Top up
        </button>
      </div>

      {/* Mock top-up (instant request) */}
      <div className="vault-card p-5">
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick top-up (pending approval)</p>
        <div className="flex gap-2">
          {MOCK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handleMockTopUp(amt)}
              disabled={mockLoading !== null}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mockLoading === amt ? 'var(--champagne)' : 'var(--vault-charcoal)',
                color: mockLoading === amt ? 'var(--vault-black)' : 'var(--text-secondary)',
                opacity: mockLoading !== null && mockLoading !== amt ? 0.5 : 1,
              }}
            >
              {mockLoading === amt ? '...' : `$${amt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Transactions</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="vault-card p-4"><div className="shimmer h-12 w-full" /></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="vault-card p-8 text-center">
            <Wallet className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-disabled)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'TOP_UP' || tx.type === 'WINNING'
              const Icon = isCredit ? ArrowDownLeft : tx.type === 'PURCHASE' ? Minus : ArrowUpRight
              const color = isCredit ? 'var(--emerald)' : 'var(--crimson)'
              return (
                <div key={tx.id} className="vault-card p-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isCredit ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {tx.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    {tx.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{tx.description}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium shrink-0" style={{ color }}>
                    {isCredit ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
