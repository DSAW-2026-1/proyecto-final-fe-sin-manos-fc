import { useNavigate } from 'react-router-dom'

const CONDITION_LABELS = { new: 'Nuevo', like_new: 'Como nuevo', good: 'Buen estado', fair: 'Regular' }

export default function ProductCard({ product, delay = 0 }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/producto/${product.id}`)}
      className="animate-fadeUp"
      style={{
        animationDelay: `${delay}ms`,
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-100)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--gray-100)', position: 'relative' }}>
        <img src={product.images[0]} alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className="badge badge-navy" style={{ fontSize: 10 }}>{CONDITION_LABELS[product.condition]}</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</p>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 8 }}>{product.seller.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
            ${product.price.toLocaleString('es-CO')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>⭐ {product.rating}</span>
        </div>
      </div>
    </div>
  )
}
