import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { api } from '../api'

const STATUS_LABELS = {
  pending:   { label: 'Pendiente',  color: '#8B6B1A', bg: 'var(--gold-pale)' },
  confirmed: { label: 'Confirmada', color: '#0D2B6B', bg: 'rgba(13,43,107,0.08)' },
  delivered: { label: 'Entregada',  color: '#1A7A4A', bg: '#E6F4EC' },
  completed: { label: 'Completada', color: '#1A7A4A', bg: '#E6F4EC' },
  cancelled: { label: 'Cancelada',  color: '#C0392B', bg: '#FDECEA' },
}

const STATUS_FILTERS = [
  { key: '', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'delivered', label: 'Entregadas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export function Purchases() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const params = filterStatus ? { status: filterStatus } : {}
    api.myOrders(params)
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filterStatus])

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Mis Compras</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Historial de tus solicitudes de compra</p>
          </div>
          <button onClick={() => navigate('/carrito')} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
            🛒 Mi carrito
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilterStatus(f.key); setLoading(true) }}
              style={{
                padding: '6px 14px', borderRadius: '100px', border: '1px solid',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                borderColor: filterStatus === f.key ? 'var(--navy)' : 'var(--gray-200)',
                background: filterStatus === f.key ? 'var(--navy)' : 'var(--white)',
                color: filterStatus === f.key ? 'var(--white)' : 'var(--gray-600)',
                transition: 'all 0.15s',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '60px 0' }}>Cargando...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🛒</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8 }}>
              {filterStatus ? 'No hay compras con ese estado' : 'No tienes compras aún'}
            </p>
            {!filterStatus && (
              <button onClick={() => navigate('/home')} className="btn-primary" style={{ padding: '10px 24px' }}>Explorar productos</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, i) => {
              const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              return (
                <div key={order.order_id} className="card animate-fadeUp" style={{ animationDelay: `${i * 60}ms`, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {order.image_url ? <img src={`http://localhost:4000${order.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_title}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>Vendedor: {order.seller_name}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>${Number(order.price).toLocaleString('es-CO')}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmPurchase() {
  const navigate = useNavigate()
  const location = useLocation()
  const product = location.state?.product
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!product) { navigate('/home'); return null }

  const handleConfirm = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ productId: product.productId || product.product_id })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al crear la solicitud'); setLoading(false); return }
      navigate('/orden-exitosa', { state: { product, order: data } })
    } catch {
      setError('Error del servidor'); setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 20 }}>← Volver</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 32 }}>Confirmar tu compra</h1>

        {error && <div style={{ background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>⚠ {error}</div>}

        <div className="card animate-fadeUp" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{product.title}</p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Vendido por {product.seller?.name}</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Precio</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>${Number(product.price).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <button onClick={handleConfirm} className="btn-gold" style={{ width: '100%', padding: 16, fontSize: 15 }} disabled={loading}>
          {loading ? 'Enviando solicitud...' : 'Confirmar compra'}
        </button>
      </div>
    </div>
  )
}

export function OrderSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const { product, order } = location.state || {}

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div className="animate-fadeUp">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E6F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>¡Solicitud enviada!</h1>
          <p style={{ fontSize: 15, color: 'var(--gray-400)', marginBottom: 32 }}>El vendedor recibirá tu solicitud y te confirmará pronto.</p>

          {product && (
            <div className="card" style={{ padding: 20, textAlign: 'left', marginBottom: 32 }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>Producto</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 12 }}>{product.title}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>${Number(product.price).toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Estado</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8B6B1A' }}>Pendiente</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/home')} className="btn-outline" style={{ flex: 1, padding: 13 }}>Volver al inicio</button>
            <button onClick={() => navigate('/compras')} className="btn-primary" style={{ flex: 1, padding: 13 }}>Mis compras</button>
          </div>
        </div>
      </div>
    </div>
  )
}
