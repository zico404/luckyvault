import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Wallet, Transaction } from '@/types'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, X } from 'lucide-react'

export function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')

  useEffect(() => {
    Promise.all([
      api.getBalance(),
      api.getTransactions(),
    ]).then(([walletRes, transRes]) => {
      if (walletRes.success) setWallet(walletRes.data)
      if (transRes.success) setTransactions(transRes.data.transactions)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Wallet</h1>

      {/* Balance Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(45 100% 50% / 0.6) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Balance</p>
              <p className="text-3xl font-black text-gold gold-glow">{formatCurrency(wallet?.balance ?? 0)}</p>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="p-3 btn-gold rounded-2xl"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <WalletIcon className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 glass-card flex items-center justify-center rounded-xl ${
                    tx.type === 'DEPOSIT' || tx.type === 'WINNING' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'WINNING' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.type}</p>
                    <p className="text-[10px] text-white/30">{formatDateTime(tx.createdAt)}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${
                  tx.type === 'DEPOSIT' || tx.type === 'WINNING' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.type === 'DEPOSIT' || tx.type === 'WINNING' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTopUp(false)}
        >
          <div className="glass-card p-6 max-w-sm w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Top Up Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="text-white/30 hover:text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 glass-input text-white placeholder:text-white/20 focus:outline-none text-sm"
                min="1"
              />
              <button
                className="w-full py-3 btn-gold text-sm"
                onClick={() => {
                  setShowTopUp(false)
                  setTopUpAmount('')
                }}
              >
                Confirm Top Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
