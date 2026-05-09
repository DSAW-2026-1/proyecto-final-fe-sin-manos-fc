import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StarRating from '../components/StarRating'
import CarreraSelector from '../components/CarreraSelector'
import { useApp } from '../context/AppContext'
import { api } from '../api'

export default function Perfil() {
  const { user, logout, refreshUser } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventario')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', carrera: user?.career || '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [myProducts, setMyProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    if (!user?.userId) return
    // Cargar datos actualizados del perfil (incluye foto)
    api.getUser(user.userId).then(data => {
      setProfileData(data)
      setForm({ name: data.name || '', carrera: data.career || '' })
    }).catch(() => {})

    api.myProducts()
      .then(data => { setMyProducts(Array.isArray(data) ? data : []); setLoadingProducts(false) })
      .catch(() => setLoadingProducts(false))

    api.getReviewsBySeller(user.userId)
      .then(data => setReviews(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => {})
  }, [user?.userId])

  const currentUser = profileData || user
  const isAdmin = currentUser?.role === 'admin'

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setPhotoError('Solo JPG o PNG'); return }
    if (file.size > 2 * 1024 * 1024) { setPhotoError('La foto no puede superar 2MB'); return }
    setPhotoError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaveError('')
    if (!form.name.trim()) { setSaveError('El nombre no puede estar vacío'); return }
    if (photoError) return
    setSaveLoading(true)
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('career', form.carrera || '')
    if (photoFile) formData.append('photo', photoFile)
    const res = await api.updateUser(user.userId, formData)
    setSaveLoading(false)
    if (!res.ok) { setSaveError(res.data?.error || 'Error al guardar'); return }
    await refreshUser()
    // Recargar perfil con foto nueva
    api.getUser(user.userId).then(data => setProfileData(data)).catch(() => {})
    setEditing(false)
    setPhotoFile(null)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return
    const res = await api.deleteProduct(productId)
    if (res.ok) setMyProducts(prev => prev.filter(p => p.productId !== productId))
  }

  const avgRep = parseFloat(currentUser?.reputation || 0).toFixed(1)

  // URL foto de perfil
  const photoUrl = photoPreview ||
    (profileData?.photoUrl ? `http://localhost:4000${profileData.photoUrl}` : null) ||
    (user?.photoUrl ? `http://localhost:4000${user.photoUrl}` : null)

  const tabs = isAdmin ? [] : [
    { id: 'inventario', label: 'Mi Inventario' },
    ...(currentUser?.isSeller ? [{ id: 'reseñas', label: `Reseñas (${reviews.length})` }] : []),
  ]

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* Profile card */}
        <div className="card animate-fadeUp" style={{ padding: 28, marginBottom: 24, display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'var(--navy-dark)', border: '4px solid var(--gold-pale)', overflow: 'hidden' }}>
              {photoUrl
                ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : (currentUser?.name?.charAt(0) || 'U')}
            </div>
            {editing && (
              <label style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', border: '2px solid var(--white)', color: 'var(--white)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✏ <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={handlePhoto} />
              </label>
            )}
          </div>

          {/* Info / Edit */}
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Nombre *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  {saveError && <span className="input-error">{saveError}</span>}
                </div>
                <div className="input-group">
                  <label className="input-label">Programa académico (opcional)</label>
                  <CarreraSelector value={form.carrera} onChange={v => setForm(p => ({ ...p, carrera: v }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Foto de perfil</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', border: '1.5px dashed var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', width: 'fit-content' }}>
                    📷 Cambiar foto
                    <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={handlePhoto} />
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>JPG, PNG · máx 2MB</span>
                  {photoError && <span className="input-error">{photoError}</span>}
                  {photoFile && !photoError && <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Lista para guardar</span>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} disabled={saveLoading || !!photoError}>
                    {saveLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button onClick={() => { setEditing(false); setPhotoError(''); setSaveError(''); setPhotoFile(null); setPhotoPreview(null) }} className="btn-ghost" style={{ fontSize: 13 }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{currentUser?.name}</h2>
                  {isAdmin
                    ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: '#FDECEA', color: 'var(--danger)', border: '1px solid #F5C6C2' }}>Administrador</span>
                    : <span className={`badge ${currentUser?.isSeller ? 'badge-gold' : 'badge-navy'}`}>{currentUser?.isSeller ? 'Vendedor' : 'Comprador'}</span>
                  }
                  {reviews.length < 5 && currentUser?.role !== 'admin' && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: 'var(--gold-pale)', color: '#8B6B1A', border: '1px solid #E8C84A', whiteSpace: 'nowrap' }}>Nuevo</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>{currentUser?.email}</p>
                {(profileData?.career || user?.career) && (
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>{profileData?.career || user?.career}</p>
                )}
                {!isAdmin && (
                  <div style={{ display: 'flex', gap: 24, marginBottom: 12, alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <StarRating value={Math.round(parseFloat(avgRep))} readonly size={16} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{avgRep}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Reputación ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{myProducts.length}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Publicaciones</p>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setEditing(true)} className="btn-outline" style={{ padding: '7px 18px', fontSize: 13 }}>Editar perfil</button>
                  {!isAdmin && <button onClick={() => navigate('/crear-producto')} className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>+ Publicar</button>}
                </div>
              </>
            )}
          </div>

          <button onClick={async () => { await logout(); navigate('/') }} style={{ background: 'none', border: '1px solid var(--gray-200)', color: 'var(--gray-400)', padding: '7px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
            Cerrar sesión
          </button>
        </div>

        {/* Admin panel shortcut */}
        {isAdmin && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>🛡️</p>
            <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 24 }}>Tienes acceso de administrador a la plataforma</p>
            <button onClick={() => navigate('/admin')} className="btn-primary" style={{ padding: '14px 40px', fontSize: 15 }}>
              Ir al Panel de Admin
            </button>
          </div>
        )}

        {/* Tabs */}
        {!isAdmin && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 6, border: '1px solid var(--gray-100)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: 9, borderRadius: 'var(--radius-md)', background: activeTab === t.id ? 'var(--navy)' : 'transparent', color: activeTab === t.id ? 'var(--white)' : 'var(--gray-600)', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Inventario */}
        {!isAdmin && activeTab === 'inventario' && (
          <div className="animate-fadeIn">
            {loadingProducts ? (
              <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0' }}>Cargando...</p>
            ) : myProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 8 }}>Aún no has publicado nada</p>
                <button onClick={() => navigate('/crear-producto')} className="btn-primary" style={{ padding: '10px 24px' }}>Publicar mi primer producto</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{myProducts.length} publicaciones</p>
                  <button onClick={() => navigate('/crear-producto')} className="btn-gold" style={{ padding: '7px 16px', fontSize: 13 }}>+ Nuevo</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {myProducts.map(p => (
                    <div key={p.productId} className="card" style={{ overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '3/2', overflow: 'hidden', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>${p.price.toLocaleString('es-CO')}</p>
                        {p.status === 'sold'
                          ? <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: '#FDECEA', color: 'var(--danger)', border: '1px solid #F5C6C2', marginBottom: 8 }}>Agotado</span>
                          : p.stock === 1
                            ? <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D', marginBottom: 8 }}>Última unidad</span>
                            : p.stock > 1
                              ? <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: '#E6F4EC', color: 'var(--success)', border: '1px solid #A7D7B7', marginBottom: 8 }}>{p.stock} en stock</span>
                              : null
                        }
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => navigate('/editar-producto', { state: { product: p } })} className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: 12 }}>Editar</button>
                          <button onClick={() => handleDelete(p.productId)} className="btn-ghost" style={{ flex: 1, padding: '6px', fontSize: 12, color: 'var(--danger)' }}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reseñas */}
        {!isAdmin && activeTab === 'reseñas' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>⭐</p>
                <p style={{ fontSize: 15, color: 'var(--gray-600)' }}>Aún no tienes reseñas</p>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>Las reseñas aparecerán cuando otros compren tus productos</p>
              </div>
            ) : reviews.map(r => (
              <div key={r.reviewId} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{r.buyerName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={r.rating} readonly size={15} />
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>sobre <strong style={{ color: 'var(--navy)' }}>{r.productTitle}</strong></span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--gray-400)' }}>
                    <p>{new Date(r.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    <p>{new Date(r.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 10 }}>{r.comment}</p>}
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>¿Fue útil esta reseña?</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500 }}>👍 {r.helpful || 0} personas</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
