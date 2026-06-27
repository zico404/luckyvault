import { useEffect, useState } from 'react'
import { api, Transaction } from '@/lib/api'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, Trophy, ArrowRight } from 'lucide-react'

export function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getBalance(),
      api.getTransactions(),
    ]).then(([balRes, txRes]) => {
      setBalance(balRes.data.balance || 0)
      setTransactions(txRes.data.transactions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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
          onClick={() => setShowTopUp(true)}
          className="btn-primary mt-4"
        >
          <Plus className="w-4 h-4" /> Top up
        </button>
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
                      {tx.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {tx.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{tx.description}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium shrink-0" style={{ color }}>
                    {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top up modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="vault-card p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Top up wallet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Select an amount to add to your wallet.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTopUp(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setShowTopUp(false)} className="btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
