import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { CATEGORIES } from '../context/AppContext'
import { api } from '../api'

const CONDITION_LABELS = { new: 'Nuevo', used: 'Usado' }

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [condition, setCondition] = useState('Todos')
  const [dbCategories, setDbCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getCategories().then(cats => setDbCategories(cats)).catch(() => {})
  }, [])

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    if (condition !== 'Todos') params.condition = condition
    if (category !== 'Todos') {
      const found = dbCategories.find(c => c.name === category)
      if (found) params.categoryId = found.category_id
    }
    setLoading(true)
    api.getProducts(params)
      .then(res => { setProducts(res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, category, minPrice, maxPrice, condition, dbCategories])

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px var(--page-px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }} className="animate-fadeUp">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Productos de hoy</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{products.length} productos disponibles</p>
        </div>

        {/* Search + filter button */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4, pointerEvents: 'none' }}>🔍</span>
            <input className="input-field" style={{ paddingLeft: 40 }}
              placeholder="Buscar productos..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline" style={{ padding: '0 16px', flexShrink: 0, fontSize: 13 }}>
            ⚙ Filtros
          </button>
        </div>

        {/* Mobile category chips */}
        <div className="home-filters-mobile" style={{ overflowX: 'auto', gap: 8, paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 100,
              background: category === c ? 'var(--navy)' : 'var(--white)',
              color: category === c ? 'var(--white)' : 'var(--gray-600)',
              border: category === c ? 'none' : '1px solid var(--gray-200)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', minHeight: 36
            }}>{c}</button>
          ))}
        </div>

        {/* Filter panel (mobile dropdown) */}
        {showFilters && (
          <div className="card animate-fadeIn" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Precio mín (COP)</label>
                <input className="input-field" type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Precio máx (COP)</label>
                <input className="input-field" type="number" placeholder="Sin límite" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select className="input-field" value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="Todos">Todos</option>
                  <option value="new">Nuevo</option>
                  <option value="used">Usado</option>
                </select>
              </div>
            </div>
            <button onClick={() => { setMinPrice(''); setMaxPrice(''); setCondition('Todos'); setCategory('Todos'); setShowFilters(false) }}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="home-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>

          {/* Desktop sidebar */}
          <div className="home-sidebar card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtros</h3>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Categoría</p>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: category === c ? 'rgba(13,43,107,0.08)' : 'transparent', color: category === c ? 'var(--navy)' : 'var(--gray-600)', fontWeight: category === c ? 600 : 400, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{c}</button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 14, marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Precio (COP)</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" style={{ fontSize: 12, padding: '7px 10px' }} placeholder="Mín" value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number" />
                <input className="input-field" style={{ fontSize: 12, padding: '7px 10px' }} placeholder="Máx" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number" />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Estado</p>
              {[['Todos','Todos'],['new','Nuevo'],['used','Usado']].map(([v,l]) => (
                <button key={v} onClick={() => setCondition(v)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: condition === v ? 'rgba(13,43,107,0.08)' : 'transparent', color: condition === v ? 'var(--navy)' : 'var(--gray-600)', fontWeight: condition === v ? 600 : 400, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div>
            {loading ? (
              <div className="grid-products">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', aspectRatio: '3/4', backgroundImage: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)' }}>No hay productos</p>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>¡Sé el primero en publicar!</p>
              </div>
            ) : (
              <div className="grid-products">
                {products.map((p, i) => (
                  <div key={p.productId} onClick={() => navigate(`/producto/${p.productId}`)}
                    className="animate-fadeUp card"
                    style={{ animationDelay: `${i * 40}ms`, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
                  >
                    <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--gray-100)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 36 }}>📦</span>}
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span className="badge badge-navy" style={{ fontSize: 10 }}>{CONDITION_LABELS[p.condition] || p.condition}</span>
                      </div>
                      {p.stock === 1 && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: '100px', background: '#D97706', color: '#fff', whiteSpace: 'nowrap' }}>Última unidad</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>{p.sellerName}</p>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--navy)' }}>${p.price.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
