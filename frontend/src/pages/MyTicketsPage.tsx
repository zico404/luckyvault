import { useEffect, useState } from 'react'
import { api, Ticket } from '@/lib/api'
import { Ticket as TicketIcon, Clock } from 'lucide-react'

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyTickets().then((res) => {
      setTickets(res.data.tickets || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
          My tickets
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          View all your purchased tickets
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vault-card p-5"><div className="shimmer h-16 w-full" /></div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="vault-card p-12 text-center">
          <TicketIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No tickets yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Purchase a ticket to enter a draw</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="vault-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {ticket.draw?.title || 'Draw'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {ticket.ticketCode}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="vault-badge"
                    style={{
                      background: ticket.status === 'ACTIVE' ? 'rgba(5,150,105,0.1)' : ticket.status === 'WON' ? 'var(--champagne-subtle)' : 'var(--vault-charcoal)',
                      color: ticket.status === 'ACTIVE' ? 'var(--emerald)' : ticket.status === 'WON' ? 'var(--champagne)' : 'var(--text-muted)'
                    }}
                  >
                    {ticket.status}
                  </span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    ${Number(ticket.purchasePrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
