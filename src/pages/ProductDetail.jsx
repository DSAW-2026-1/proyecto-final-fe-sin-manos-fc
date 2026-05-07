import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StarRating from '../components/StarRating'
import { useApp } from '../context/AppContext'
import { api, convApi } from '../api'

const CONDITION_LABELS = { new: 'Nuevo', used: 'Usado', like_new: 'Como nuevo', good: 'Buen estado', fair: 'Regular' }

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [selectedImg, setSelectedImg] = useState(0)
  const [cartMsg, setCartMsg] = useState('')
  const [addingCart, setAddingCart] = useState(false)

  const isOwner = user && product && user.userId === product.seller?.id

  const loadReviews = async (productId) => {
    const data = await api.getReviewsByProduct(productId)
    const list = Array.isArray(data) ? data : []
    setReviews(list)
    if (user) setAlreadyReviewed(list.some(r => r.buyer_id === user.userId))
  }

  useEffect(() => {
    Promise.all([api.getProduct(id)])
      .then(([prod]) => {
        setProduct(prod)
        setLoading(false)
        if (!prod.error) loadReviews(id)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleReview = async () => {
    setReviewError('')
    if (!myRating) { setReviewError('Selecciona una calificación de 1 a 5 estrellas'); return }
    setSubmitting(true)
    const res = await api.createReview({ productId: id, rating: myRating, comment: myComment })
    setSubmitting(false)
    if (!res.ok) { setReviewError(res.data?.error || 'Error al enviar la reseña'); return }
    setReviewSuccess(true)
    setMyRating(0); setMyComment('')
    loadReviews(id)
  }

  const handleAddToCart = async () => {
    setAddingCart(true)
    setCartMsg('')
    const res = await api.addToCart({ productId: id })
    setAddingCart(false)
    if (res.ok) {
      setCartMsg('success')
    } else {
      setCartMsg(res.data?.error || 'No se pudo agregar al carrito')
    }
    setTimeout(() => setCartMsg(''), 3000)
  }

  const handleHelpful = async (reviewId) => {
    await api.markHelpful(reviewId)
    loadReviews(id)
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0

  if (loading) return <div className="page-container"><Navbar /><div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>Cargando...</div></div>
  if (!product || product.error) return <div className="page-container"><Navbar /><div style={{ textAlign: 'center', padding: '80px 0' }}>Producto no encontrado</div></div>

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24 }}>← Volver</button>

        <div className="product-detail-grid animate-fadeUp" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, marginBottom: 48 }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.images?.[selectedImg]
                ? <img src={product.images[selectedImg]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 60 }}>📦</span>}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImg(i)} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: i === selectedImg ? '2px solid var(--navy)' : '1px solid var(--gray-100)', cursor: 'pointer', opacity: i === selectedImg ? 1 : 0.7 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className="badge badge-navy">{product.category}</span>
                <span className="badge badge-gold">{CONDITION_LABELS[product.condition] || product.condition}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.3, marginBottom: 8 }}>{product.title}</h1>
              {reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating value={Math.round(avgRating)} readonly size={16} />
                  <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{avgRating} ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>Precio</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--navy)' }}>${Number(product.price).toLocaleString('es-CO')}</p>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8 }}>Descripción</p>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{product.description}</p>
            </div>

            {/* Seller */}
            <div
              style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              onClick={() => navigate(`/vendedor/${product.seller?.id}`)}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--navy)', flexShrink: 0, overflow: 'hidden' }}>
                {product.seller?.photoUrl
                  ? <img src={`http://localhost:4000${product.seller.photoUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : product.seller?.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', textDecoration: 'underline' }}>{product.seller?.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <StarRating value={Math.round(product.seller?.reputation || 0)} readonly size={13} />
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{parseFloat(product.seller?.reputation || 0).toFixed(1)}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0 }}>Ver perfil →</span>
            </div>

            {/* Actions — solo si no es el dueño */}
            {!isOwner && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cartMsg === 'success' && (
                  <div style={{ background: '#E6F4EC', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✓ Agregado al carrito</span>
                    <button onClick={() => navigate('/carrito')} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--navy)', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>Ver carrito</button>
                  </div>
                )}
                {cartMsg && cartMsg !== 'success' && (
                  <p style={{ fontSize: 12, color: 'var(--danger)' }}>⚠ {cartMsg}</p>
                )}
                <button onClick={() => navigate('/confirmar', { state: { product } })} className="btn-gold" style={{ width: '100%', padding: 15, fontSize: 15, justifyContent: 'center' }}>
                  Solicitar compra
                </button>
                <button onClick={handleAddToCart} className="btn-outline" style={{ width: '100%', padding: 14, justifyContent: 'center' }} disabled={addingCart}>
                  {addingCart ? 'Agregando...' : '🛒 Agregar al carrito'}
                </button>
                <button onClick={async () => {
                    const res = await convApi.create({ productId: id, sellerId: product.seller?.id })
                    const convId = res.data?.conversationId || null
                    navigate('/mensajes', { state: { conversationId: convId } })
                  }} className="btn-outline" style={{ width: '100%', padding: 14, justifyContent: 'center' }}>
                  Contactar vendedor
                </button>
              </div>
            )}
            {isOwner && (
              <div style={{ background: 'var(--gold-pale)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: '#8B6B1A', textAlign: 'center' }}>
                Este es tu producto
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 24 }}>
            Reseñas {reviews.length > 0 && <span style={{ fontSize: 16, color: 'var(--gray-400)', fontWeight: 400 }}>({reviews.length})</span>}
          </h2>

          {/* Form para dejar reseña */}
          {!isOwner && !alreadyReviewed && !reviewSuccess && (
            <div className="card" style={{ padding: 24, marginBottom: 32 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 16 }}>Deja tu calificación</p>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 8 }}>Calificación *</p>
                <StarRating value={myRating} onChange={setMyRating} size={32} />
                {myRating > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][myRating]}
                  </p>
                )}
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Comentario (opcional)</label>
                <textarea className="input-field" rows={3} placeholder="Comparte tu experiencia con este producto..." value={myComment} onChange={e => setMyComment(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              {reviewError && <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 12 }}>⚠ {reviewError}</p>}
              <button onClick={handleReview} className="btn-primary" style={{ padding: '10px 24px' }} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </div>
          )}

          {reviewSuccess && (
            <div style={{ background: '#E6F4EC', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✓ ¡Reseña publicada! Gracias por tu opinión.
            </div>
          )}

          {alreadyReviewed && !reviewSuccess && (
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--gray-400)' }}>
              Ya dejaste una reseña para este producto.
            </div>
          )}

          {isOwner && (
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--gray-400)' }}>
              No puedes reseñar tu propio producto.
            </div>
          )}

          {/* Lista de reseñas */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>⭐</p>
              <p style={{ fontSize: 14 }}>Sé el primero en reseñar este producto</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(r => (
                <div key={r.review_id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{r.buyer_name}</p>
                      <StarRating value={r.rating} readonly size={16} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'right' }}>
                      {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      <br />
                      {new Date(r.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 12 }}>{r.comment}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
                    <button onClick={() => handleHelpful(r.review_id)} style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      👍 Útil ({r.helpful || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
