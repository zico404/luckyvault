import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Ticket } from '@/types'
import { Ticket as TicketIcon, QrCode, Eye } from 'lucide-react'

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    api.getMyTickets().then((res) => {
      if (res.success) setTickets(res.data.tickets)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">My Tickets</h1>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <TicketIcon className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No tickets yet</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card flex items-center justify-center rounded-xl">
                  <TicketIcon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-[180px]">{ticket.ticketCode}</p>
                  <p className="text-[10px] text-white/30">{formatDateTime(ticket.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-medium rounded-full border ${
                  ticket.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  ticket.status === 'WON' ? 'bg-gold/10 text-gold border-gold/20' :
                  'bg-white/5 text-white/30 border-white/10'
                }`}>
                  {ticket.status}
                </span>
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="p-2 glass-card hover:bg-white/10 transition-colors rounded-xl"
                >
                  <Eye className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="glass-card p-6 max-w-sm w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <QrCode className="w-16 h-16 text-gold mx-auto" />
              <h3 className="text-lg font-bold text-white">Ticket Details</h3>
              <div className="bg-white rounded-2xl p-4 inline-block">
                <QrCode className="w-40 h-40 text-black" />
              </div>
              <p className="text-sm font-bold text-gold tracking-widest">{selectedTicket.ticketCode}</p>
              <p className="text-xs text-white/30">Purchased: {formatDateTime(selectedTicket.createdAt)}</p>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 btn-gold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
