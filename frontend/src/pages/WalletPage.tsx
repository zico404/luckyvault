import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Wallet, Transaction } from '@/types'
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  RefreshCw,
} from 'lucide-react'

const topUpOptions = [10, 25, 50, 100]

const transactionIcon = (type: string) => {
  switch (type) {
    case 'DEPOSIT': return <ArrowDownRight className="w-5 h-5 text-green-400" />
    case 'PURCHASE': return <ArrowUpRight className="w-5 h-5 text-red-400" />
    case 'WINNING': return <Trophy className="w-5 h-5 text-gold" />
    case 'REFUND': return <RefreshCw className="w-5 h-5 text-blue-400" />
    default: return <WalletIcon className="w-5 h-5 text-muted-foreground" />
  }
}

export function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = async (p: number = 1) => {
    const [walletRes, txRes] = await Promise.all([
      api.getBalance(),
      api.getTransactions(p),
    ])
    if (walletRes.success) setWallet(walletRes.data)
    if (txRes.success) {
      setTransactions(prev => p === 1 ? txRes.data.transactions : [...prev, ...txRes.data.transactions])
      setTotalPages(txRes.data.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleTopUp = (amount: number) => {
    // Simulated deposit
    setWallet(prev => prev ? { ...prev, balance: prev.balance + amount } : prev)
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'DEPOSIT',
      amount,
      balanceAfter: (wallet?.balance ?? 0) + amount,
      status: 'COMPLETED',
      description: 'Deposit via Top Up',
      createdAt: new Date().toISOString(),
    }, ...prev])
    setShowTopUp(false)
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/40 via-card to-card p-6 md:p-8 border border-border">
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gold">
            {formatCurrency(wallet?.balance ?? 0)}
          </h2>
          <button
            onClick={() => setShowTopUp(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-surface font-semibold rounded-2xl hover:bg-gold/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Top Up
          </button>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTopUp(false)}
        >
          <div className="bg-card rounded-3xl p-8 border border-border max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Top Up Wallet</h3>
            <p className="text-muted-foreground text-sm mb-6">Select amount to deposit</p>
            <div className="grid grid-cols-2 gap-3">
              {topUpOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleTopUp(amount)}
                  className="py-3 bg-gold text-surface font-bold rounded-2xl hover:bg-gold/90 transition-all"
                >
                  ${amount}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTopUp(false)}
              className="w-full mt-4 py-3 text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Transactions</h3>

        {transactions.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isCredit = ['WINNING', 'DEPOSIT', 'REFUND'].includes(tx.type)
              return (
                <div key={tx.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {transactionIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {tx.type.toLowerCase().replace('_', ' ')}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {page < totalPages && (
          <button
            onClick={() => { const next = page + 1; setPage(next); loadData(next) }}
            className="w-full mt-4 py-3 bg-card border border-border text-muted-foreground rounded-2xl hover:text-white transition-all"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  )
}
