import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Ticket } from '@/types'
import { Ticket as TicketIcon, QrCode, X } from 'lucide-react'

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  const loadTickets = async (p: number) => {
    const res = await api.getMyTickets(p)
    if (res.success) {
      setTickets(prev => p === 1 ? res.data.tickets : [...prev, ...res.data.tickets])
      setTotalPages(res.data.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => { loadTickets(1) }, [])

  const loadMore = () => {
    if (page < totalPages) {
      const next = page + 1
      setPage(next)
      loadTickets(next)
    }
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">My Tickets</h1>

      {tickets.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <TicketIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No tickets yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Buy a ticket to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {ticket.draw?.title ?? 'Draw'}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    ticket.status === 'WON' ? 'bg-green-500/15 text-green-400' :
                    ticket.status === 'LOST' ? 'bg-muted text-muted-foreground' :
                    'bg-gold/15 text-gold'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Code</p>
                    <p className="text-sm font-mono font-bold text-gold tracking-wider">{ticket.ticketCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(ticket.purchasePrice)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Purchased: {formatDate(ticket.createdAt)}
                  </p>
                  <button
                    onClick={() => setSelectedTicket(ticket.ticketCode)}
                    className="flex items-center gap-1 text-gold hover:text-gold/80 text-sm transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    Show QR
                  </button>
                </div>
              </div>
            ))}
          </div>

          {page < totalPages && (
            <button
              onClick={loadMore}
              className="w-full py-3 bg-card border border-border text-muted-foreground rounded-2xl hover:text-white transition-all"
            >
              Load More
            </button>
          )}
        </>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div className="bg-card rounded-3xl p-8 border border-border max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Ticket QR</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-2xl p-4 mb-4 flex justify-center">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <p className="text-center text-sm font-mono font-bold text-gold tracking-wider break-all">
              {selectedTicket}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
