import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StarRating from '../components/StarRating'
import { api } from '../api'

export default function PublicPerfil() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')

  useEffect(() => {
    Promise.all([
      api.getUser(userId),
      api.getProducts({ sellerId: userId }),
      api.getReviewsBySeller(userId),
    ]).then(([user, prods, revs]) => {
      setSeller(user)
      setProducts(Array.isArray(prods) ? prods : [])
      setReviews(Array.isArray(revs) ? revs : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="page-container">
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>Cargando...</div>
    </div>
  )

  if (!seller || seller.error) return (
    <div className="page-container">
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 0' }}>Perfil no encontrado</div>
    </div>
  )

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24 }}>← Volver</button>

        {/* Header del perfil */}
        <div className="card animate-fadeUp" style={{ padding: 32, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'var(--navy)', flexShrink: 0, overflow: 'hidden' }}>
            {seller.photoUrl
              ? <img src={`http://localhost:4000${seller.photoUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : seller.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{seller.name}</h1>
            {seller.university && (
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 8 }}>{seller.university}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <StarRating value={Math.round(parseFloat(seller.reputation || 0))} readonly size={16} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{parseFloat(seller.reputation || 0).toFixed(1)}</span>
              <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{products.length}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Productos</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{avgRating}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Calificación</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 4, width: 'fit-content' }}>
          {[
            { key: 'products', label: `Productos (${products.length})` },
            { key: 'reviews', label: `Reseñas (${reviews.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
                background: tab === t.key ? 'var(--white)' : 'transparent',
                color: tab === t.key ? 'var(--navy)' : 'var(--gray-400)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📦</p>
              <p style={{ fontSize: 14 }}>Este vendedor no tiene productos activos</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map((p, i) => {
                const pid = p.productId || p.product_id
                return (
                  <div
                    key={pid}
                    className="card animate-fadeUp"
                    style={{ animationDelay: `${i * 40}ms`, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => navigate(`/producto/${pid}`)}>
                    <div style={{ aspectRatio: '4/3', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📦'}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>${Number(p.price).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>⭐</p>
              <p style={{ fontSize: 14 }}>Este vendedor aún no tiene reseñas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.review_id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{r.buyer_name}</p>
                      <StarRating value={r.rating} readonly size={15} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>{r.comment}</p>}
                  {r.product_title && <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 8 }}>📦 {r.product_title}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
