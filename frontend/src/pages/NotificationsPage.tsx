import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types'
import { Bell, CheckCheck } from 'lucide-react'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await api.getNotifications()
      if (res.success) setNotifications(res.data.notifications)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-3xl" />)}</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`glass-card p-4 transition-all ${
                !notif.isRead ? 'border-gold/20 bg-gold/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{notif.title}</p>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-white/20 mt-2">{formatDateTime(notif.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
