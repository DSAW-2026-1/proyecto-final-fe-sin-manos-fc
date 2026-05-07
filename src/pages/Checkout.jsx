import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { api } from '../api'

const PAYMENT_METHODS = [
  { key: 'cash_pickup', label: 'Efectivo al recoger', icon: '💵', desc: 'Pagas en efectivo cuando recoges el producto con el vendedor' },
  { key: 'bank_transfer', label: 'Transferencia bancaria simulada', icon: '🏦', desc: 'Simula una transferencia al vendedor antes del intercambio' },
  { key: 'cash_on_delivery', label: 'Pago contra entrega', icon: '🚚', desc: 'Pagas en efectivo cuando el producto llega a ti' },
]

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useApp()
  const { cartId, items = [] } = location.state || {}
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].key)
  const [notes, setNotes] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  const ownItems = items.filter(item => (item.sellerId || item.seller_id) === user?.userId)
  const hasOwnItems = ownItems.length > 0
  const total = items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0)

  if (!cartId) {
    navigate('/carrito', { replace: true })
    return null
  }

  const handleConfirm = async () => {
    setConfirming(true)
    setError('')
    const res = await api.createOrderFromCart({ cartId, paymentMethod: 'simulated', notes })
    setConfirming(false)
    if (!res.ok) { setError(res.data?.error || 'Error al confirmar el pedido'); return }
    navigate('/orden-exitosa', {
      state: {
        order: res.data,
        items,
        paymentMethodLabel: PAYMENT_METHODS.find(p => p.key === paymentMethod)?.label,
        notes,
      }
    })
  }

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate('/carrito')} className="btn-ghost" style={{ marginBottom: 24 }}>← Volver al carrito</button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Confirmar pedido</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 32 }}>{items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Warning productos propios */}
            {hasOwnItems && (
              <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>⚠ No puedes comprar tus propios productos</p>
                <p style={{ fontSize: 12, color: '#92400E' }}>
                  Quita del carrito: {ownItems.map(i => i.title).join(', ')}
                </p>
              </div>
            )}

            {/* Resumen de items */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Resumen de compra</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item) => {
                  const pid = item.productId || item.product_id
                  const isOwn = (item.sellerId || item.seller_id) === user?.userId
                  return (
                    <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isOwn ? 0.5 : 1 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {item.image_url
                          ? <img src={`http://localhost:4000${item.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '📦'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                        <p style={{ fontSize: 12, color: isOwn ? 'var(--danger)' : 'var(--gray-400)' }}>
                          {isOwn ? 'Este producto es tuyo y no puede comprarse' : item.seller_name}
                        </p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--navy)', flexShrink: 0 }}>
                        ${Number(item.price).toLocaleString('es-CO')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Método de pago */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Método de pago</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 'var(--radius-lg)', border: `2px solid ${paymentMethod === pm.key ? 'var(--navy)' : 'var(--gray-100)'}`,
                      background: paymentMethod === pm.key ? 'var(--gold-pale)' : 'var(--white)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                    }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{pm.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>{pm.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.4 }}>{pm.desc}</p>
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${paymentMethod === pm.key ? 'var(--navy)' : 'var(--gray-300)'}`,
                      background: paymentMethod === pm.key ? 'var(--navy)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {paymentMethod === pm.key && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--white)' }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Notas para el vendedor <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--gray-400)' }}>(opcional)</span></h2>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Instrucciones de entrega, horarios disponibles, punto de encuentro..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Panel lateral */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Total del pedido</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>${total.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Envío</span>
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>Coordinar</span>
            </div>
            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, marginTop: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 16, padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>
              Pago: {PAYMENT_METHODS.find(p => p.key === paymentMethod)?.label}
            </div>
            {error && (
              <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>⚠ {error}</p>
            )}
            <button
              onClick={handleConfirm}
              className="btn-gold"
              style={{ width: '100%', padding: 14, fontSize: 14, justifyContent: 'center' }}
              disabled={confirming || hasOwnItems}>
              {confirming ? 'Confirmando...' : 'Confirmar pedido'}
            </button>
            {hasOwnItems && (
              <p style={{ fontSize: 11, color: 'var(--danger)', textAlign: 'center', marginTop: 4 }}>
                Quita los productos propios del carrito para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
