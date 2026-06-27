import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types'
import {
  Bell,
  BellOff,
  Trophy,
  Ticket,
  PlayCircle,
  CheckCircle,
  CheckCheck,
} from 'lucide-react'

const notificationIcon = (type: string) => {
  switch (type) {
    case 'WINNER': return <Trophy className="w-6 h-6 text-gold" />
    case 'TICKET_PURCHASED': return <Ticket className="w-6 h-6 text-gold" />
    case 'DRAW_STARTED': return <PlayCircle className="w-6 h-6 text-gold" />
    case 'DRAW_COMPLETED': return <CheckCircle className="w-6 h-6 text-gold" />
    default: return <Bell className="w-6 h-6 text-gold" />
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [notifRes, unreadRes] = await Promise.all([
      api.getNotifications(),
      api.getUnreadCount(),
    ])
    if (notifRes.success) setNotifications(notifRes.data.notifications)
    if (unreadRes.success) setUnreadCount(unreadRes.data.count)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const markAllRead = async () => {
    await api.markAllNotificationsRead()
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const markRead = async (id: string) => {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold/80 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <BellOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={`bg-card rounded-2xl p-4 border border-border flex items-start gap-3 transition-all cursor-pointer ${
                !notif.isRead ? 'border-primary/30 bg-primary/5' : ''
              }`}
            >
              {notificationIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{notif.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.body}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{formatDateTime(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
