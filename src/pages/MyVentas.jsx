import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../api'

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: '#8B6B1A', bg: 'var(--gold-pale)' },
  confirmed: { label: 'Confirmada', color: '#0D2B6B', bg: 'rgba(13,43,107,0.08)' },
  delivered: { label: 'Entregada',  color: '#1A7A4A', bg: '#E6F4EC' },
  completed: { label: 'Completada', color: '#1A7A4A', bg: '#E6F4EC' },
  cancelled: { label: 'Cancelada',  color: '#C0392B', bg: '#FDECEA' },
}

export default function MyVentas() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const loadOrders = () => {
    api.myVentas()
      .then(data => {
        setOrders(Array.isArray(data) ? data : (data?.data || []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [])

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId)
    const res = await api.updateOrderStatus(orderId, status)
    setUpdating(null)
    if (res.ok) loadOrders()
  }

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Mis Ventas</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Órdenes de compra recibidas en tus productos</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '60px 0' }}>Cargando...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📊</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8 }}>No tienes ventas aún</p>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Cuando alguien compre uno de tus productos aparecerá aquí</p>
            <button onClick={() => navigate('/crear-producto')} className="btn-primary" style={{ padding: '10px 24px' }}>Publicar producto</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, i) => {
              const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              const orderId = order.order_id || order.orderId
              return (
                <div key={orderId} className="card animate-fadeUp" style={{ animationDelay: `${i * 60}ms`, padding: 18 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {order.image_url
                        ? <img src={`http://localhost:4000${order.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.product_title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>
                        Comprador: <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{order.buyer_name}</span>
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>
                        ${Number(order.price).toLocaleString('es-CO')}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                        {new Date(order.created_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(orderId, 'confirmed')}
                          disabled={updating === orderId}
                          className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: 12 }}>
                          {updating === orderId ? 'Actualizando...' : 'Confirmar orden'}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(orderId, 'delivered')}
                          disabled={updating === orderId}
                          className="btn-gold"
                          style={{ padding: '8px 18px', fontSize: 12 }}>
                          {updating === orderId ? 'Actualizando...' : 'Marcar entregado'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
