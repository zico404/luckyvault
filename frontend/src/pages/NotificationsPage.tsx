import { useEffect, useState } from 'react'
import { api, Notification } from '@/lib/api'
import { Bell, BellOff, Trophy, Ticket, Play, CheckCircle } from 'lucide-react'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.getNotifications().then((res) => {
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.notifications?.filter((n: Notification) => !n.isRead).length || 0)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    await api.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleMarkRead = async (id: string) => {
    await api.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'WINNER': return <Trophy className="w-4 h-4" />
      case 'TICKET_PURCHASED': return <Ticket className="w-4 h-4" />
      case 'DRAW_STARTED': return <Play className="w-4 h-4" />
      case 'DRAW_COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'WINNER': return 'var(--emerald)'
      case 'TICKET_PURCHASED': return 'var(--champagne)'
      case 'DRAW_STARTED': return 'var(--amber)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.25px' }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-xs" style={{ color: 'var(--champagne)' }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vault-card p-4"><div className="shimmer h-14 w-full" /></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="vault-card p-12 text-center">
          <BellOff className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="vault-card p-4 flex items-start gap-3 cursor-pointer hover:border-[rgba(201,169,98,0.15)] transition-colors"
              style={{ background: notif.isRead ? 'var(--vault-graphite)' : 'var(--vault-charcoal)' }}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${getIconColor(notif.type)}15`, color: getIconColor(notif.type) }}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notif.body}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: 'var(--champagne)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
