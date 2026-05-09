import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const TYPE_ICONS = {
  message: '💬', conversation: '💬',
  order: '📦', purchase: '🛒',
  review: '⭐', product: '📦',
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  return `hace ${Math.floor(hrs / 24)} d`
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const timerRef = useRef(null)

  const load = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(Array.isArray(data) ? data : (data?.data || []))
    } catch {}
  }

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, 30000)
    return () => clearInterval(timerRef.current)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const shown = notifications.slice(0, 10)

  const handleClick = async (n) => {
    const id = n.notificationId || n.notification_id
    if (!n.isRead) {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(x =>
        (x.notificationId || x.notification_id) === id ? { ...x, isRead: true } : x
      ))
    }
    setOpen(false)
    if (n.resourceType === 'order') navigate('/compras')
    else if (n.resourceType === 'conversation') navigate('/mensajes')
    else if (n.resourceType === 'product') navigate(`/producto/${n.resourceId}`)
  }

  const handleMarkAll = async () => {
    await api.markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: '100px', background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', lineHeight: 1 }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)', zIndex: 200, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>Notificaciones</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--navy)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  Marcar todas como leídas
                </button>
              )}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {shown.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 16px', fontSize: 13, color: 'var(--gray-400)' }}>Sin notificaciones</p>
              ) : shown.map(n => {
                const id = n.notificationId || n.notification_id
                const icon = TYPE_ICONS[n.type] || '🔔'
                return (
                  <button
                    key={id}
                    onClick={() => handleClick(n)}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: n.isRead ? 'transparent' : 'rgba(13,43,107,0.04)', border: 'none', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', opacity: n.isRead ? 0.55 : 1, fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 3 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{relativeTime(n.createdAt || n.created_at)}</p>
                    </div>
                    {!n.isRead && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--navy)', flexShrink: 0, marginTop: 5 }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
