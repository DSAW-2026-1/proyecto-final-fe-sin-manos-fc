import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { api, convApi } from '../api'
import { API_URL } from '../config'

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

// Secuencia de estados para el historial visual
const STATUS_SEQUENCE = [
  { key: 'pending',   label: 'Pendiente',  desc: 'Solicitud enviada al vendedor' },
  { key: 'confirmed', label: 'Confirmada', desc: 'El vendedor aceptó la orden' },
  { key: 'delivered', label: 'Entregada',  desc: 'Producto entregado' },
]

const STATUS_ORDER = { pending: 0, confirmed: 1, delivered: 2, completed: 2, cancelled: -1 }

function OrderCard({ order, expanded, onToggle, navigate }) {
  const s = STATUS_LABELS[order.status] || STATUS_LABELS.pending
  const currentIdx = STATUS_ORDER[order.status] ?? 0
  const isCancelled = order.status === 'cancelled'
  const [contacting, setContacting] = useState(false)

  const handleContact = async (e) => {
    e.stopPropagation()
    setContacting(true)
    const pid = order.product_id || order.productId
    const sid = order.seller_id || order.sellerId
    const res = await convApi.create({ productId: pid, sellerId: sid })
    setContacting(false)
    navigate('/mensajes', { state: { conversationId: res.data?.conversationId || null } })
  }

  return (
    <div
      className="card animate-fadeUp"
      style={{ overflow: 'hidden', cursor: 'pointer', border: expanded ? '1.5px solid var(--navy)' : '1px solid var(--gray-100)', transition: 'border-color 0.15s' }}
      onClick={onToggle}
    >
      {/* Fila resumen — siempre visible */}
      <div style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {order.image_url ? <img src={`${API_URL}${order.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product_title}</p>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>Vendedor: {order.seller_name}</p>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>${Number(order.price).toLocaleString('es-CO')}</p>
          <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
          <span style={{ fontSize: 13, color: 'var(--gray-400)', lineHeight: 1 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div
          style={{ borderTop: '1px solid var(--gray-100)', background: 'var(--gray-50)', padding: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Imagen grande + info */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: 120, height: 120, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                {order.image_url
                  ? <img src={`${API_URL}${order.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '📦'}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Vendedor */}
              <div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Vendedor</p>
                <button
                  onClick={() => navigate(`/vendedor/${order.seller_id || order.sellerId}`)}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: 'var(--navy)', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
                  {order.seller_name} →
                </button>
              </div>

              {/* Precio detallado */}
              <div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Precio</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
                  ${Number(order.price).toLocaleString('es-CO')}
                </p>
              </div>

              {/* Fecha */}
              <div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Fecha de solicitud</p>
                <p style={{ fontSize: 13, color: 'var(--gray-800)' }}>
                  {new Date(order.created_at).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* N° orden */}
              {order.order_id && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>N° de orden</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', fontFamily: 'monospace' }}>#{order.order_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de estados */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Historial de estados</p>
            {isCancelled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FDECEA', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 16 }}>✕</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#C0392B' }}>Cancelada</p>
                  <p style={{ fontSize: 11, color: '#C0392B', opacity: 0.8 }}>Esta orden fue cancelada</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {STATUS_SEQUENCE.map((step, idx) => {
                  const isDone = idx <= currentIdx
                  const isActive = idx === currentIdx
                  const isFuture = idx > currentIdx
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {/* Línea vertical + círculo */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                          background: isDone ? (isActive ? 'var(--navy)' : '#1A7A4A') : 'var(--gray-100)',
                          color: isDone ? 'var(--white)' : 'var(--gray-300)',
                          border: isActive ? '2px solid var(--navy)' : 'none',
                          flexShrink: 0,
                        }}>
                          {isDone && !isActive ? '✓' : idx + 1}
                        </div>
                        {idx < STATUS_SEQUENCE.length - 1 && (
                          <div style={{ width: 2, height: 24, background: idx < currentIdx ? '#1A7A4A' : 'var(--gray-200)', margin: '2px 0' }} />
                        )}
                      </div>
                      {/* Texto */}
                      <div style={{ paddingTop: 2, paddingBottom: idx < STATUS_SEQUENCE.length - 1 ? 0 : 0 }}>
                        <p style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isFuture ? 'var(--gray-300)' : (isActive ? 'var(--navy)' : 'var(--gray-700)'), marginBottom: 1 }}>
                          {step.label}
                        </p>
                        <p style={{ fontSize: 11, color: isFuture ? 'var(--gray-300)' : 'var(--gray-400)', marginBottom: idx < STATUS_SEQUENCE.length - 1 ? 14 : 0 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botón contactar */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleContact}
              disabled={contacting}
              className="btn-outline"
              style={{ padding: '8px 18px', fontSize: 13 }}>
              {contacting ? 'Abriendo chat...' : '💬 Contactar vendedor'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Purchases() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const params = filterStatus ? { status: filterStatus } : {}
    api.myOrders(params)
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filterStatus])

  const handleToggle = (orderId) => setExpandedId(prev => prev === orderId ? null : orderId)

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
              onClick={() => { setFilterStatus(f.key); setLoading(true); setExpandedId(null) }}
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
            {orders.map((order, i) => (
              <OrderCard
                key={order.order_id}
                order={order}
                expanded={expandedId === order.order_id}
                onToggle={() => handleToggle(order.order_id)}
                navigate={navigate}
              />
            ))}
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
  const { user } = useApp()
  const { order, items = [], paymentMethodLabel, product } = location.state || {}

  const total = items.length > 0
    ? items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0)
    : product ? Number(product.price) : 0

  const orderId = order?.orderId || order?.order_id || order?.id
  const orderDate = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '48px 20px' }}>
        <div className="animate-fadeUp">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E6F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 8, textAlign: 'center' }}>¡Pedido confirmado!</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 32, textAlign: 'center' }}>El vendedor recibirá tu solicitud y te confirmará pronto.</p>

          {/* Recibo */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Recibo de compra</p>
              <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{orderDate}</p>
            </div>

            {orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>N° de orden</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)', fontFamily: 'monospace' }}>#{orderId}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Comprador</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)' }}>{user?.name}</span>
            </div>

            {/* Productos del carrito */}
            {items.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Productos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((item) => {
                    const pid = item.productId || item.product_id
                    return (
                      <div key={pid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            {item.image_url ? <img src={`${API_URL}${item.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', flexShrink: 0 }}>${Number(item.price).toLocaleString('es-CO')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Producto individual (flujo legacy) */}
            {items.length === 0 && product && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Producto</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>{product.title}</p>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {paymentMethodLabel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Método de pago</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-800)' }}>{paymentMethodLabel}</span>
              </div>
            )}

            <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--gold-pale)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#8B6B1A' }}>Estado: Pendiente — el vendedor confirmará pronto</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/home')} className="btn-outline" style={{ flex: 1, padding: 13 }}>Volver al inicio</button>
            <button onClick={() => navigate('/compras')} className="btn-primary" style={{ flex: 1, padding: 13 }}>Mis compras</button>
          </div>
        </div>
      </div>
    </div>
  )
}
