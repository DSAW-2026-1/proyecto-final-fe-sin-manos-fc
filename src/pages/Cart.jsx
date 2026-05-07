import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../api'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  const loadCart = async () => {
    const data = await api.getCart()
    setCart(data)
    setLoading(false)
  }

  useEffect(() => { loadCart() }, [])

  const handleRemove = async (productId) => {
    setRemoving(productId)
    await api.removeFromCart(productId)
    setRemoving(null)
    loadCart()
  }

  const handleOrder = () => {
    if (!cart?.cartId) return
    navigate('/checkout', { state: { cartId: cart.cartId, items: cart.items || [] } })
  }

  const items = cart?.items || []
  const total = items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0)

  if (loading) return (
    <div className="page-container">
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>Cargando...</div>
    </div>
  )

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Carrito</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/compras')} className="btn-ghost">Mis compras</button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8 }}>Tu carrito está vacío</p>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Agrega productos desde el catálogo</p>
            <button onClick={() => navigate('/home')} className="btn-primary" style={{ padding: '10px 24px' }}>Explorar productos</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => {
                const pid = item.productId || item.product_id
                const sid = item.sellerId || item.seller_id
                return (
                  <div key={pid} className="card animate-fadeUp" style={{ animationDelay: `${i * 60}ms`, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div
                      style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, cursor: 'pointer' }}
                      onClick={() => navigate(`/producto/${pid}`)}>
                      {item.image_url
                        ? <img src={`http://localhost:4000${item.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                        onClick={() => navigate(`/producto/${pid}`)}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 6 }}>
                        Vendedor:{' '}
                        <span
                          style={{ color: 'var(--navy)', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => navigate(`/vendedor/${sid}`)}>
                          {item.seller_name}
                        </span>
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
                        ${Number(item.price).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(pid)}
                      disabled={removing === pid}
                      style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 12, color: 'var(--danger)', cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                      {removing === pid ? '...' : 'Quitar'}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Resumen</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>${total.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>${total.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <button onClick={handleOrder} className="btn-gold" style={{ width: '100%', padding: 14, fontSize: 14, justifyContent: 'center' }}>
                Solicitar todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
