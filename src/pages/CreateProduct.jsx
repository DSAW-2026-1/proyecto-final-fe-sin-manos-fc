import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useApp } from '../context/AppContext'
import { api } from '../api'

export default function CreateProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const editing = location.state?.product || null
  const { refreshUser, user } = useApp()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: editing?.title || '',
    description: editing?.description || '',
    price: editing?.price || '',
    categoryId: editing?.categoryId || '',
    condition: editing?.condition || '',
    stock: editing?.stock || 1,
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState(editing?.images || [])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') { navigate('/home'); return }
    api.getCategories().then(cats => setCategories(cats)).catch(() => {})
  }, [user?.role])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'El título es obligatorio'
    if (!form.description.trim()) e.description = 'La descripción es obligatoria'
    if (!form.price || Number(form.price) <= 0) e.price = 'El precio debe ser mayor a 0'
    if (!form.categoryId) e.category = 'Selecciona una categoría'
    if (!form.condition) e.condition = 'Selecciona el estado del producto'
    return e
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true); setApiError('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('categoryId', form.categoryId)
    formData.append('condition', form.condition)
    formData.append('stock', form.stock)
    images.forEach(img => formData.append('images', img))

    const res = editing
      ? await api.updateProduct(editing.productId, formData)
      : await api.createProduct(formData)

    setLoading(false)
    if (!res.ok) {
      setApiError(res.data?.details?.join('. ') || res.data?.error || 'Error al guardar el producto')
      return
    }
    // Refrescar usuario para obtener isSeller=true si fue su primer producto
    await refreshUser()
    navigate('/home')
  }

  const CONDITIONS = [
    { value: 'new', label: 'Nuevo' },
    { value: 'used', label: 'Usado' },
  ]

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 20 }}>← Volver</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
          {editing ? 'Editar Producto' : 'Crear Producto'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 32 }}>
          {editing ? 'Actualiza la información de tu publicación' : 'Publica un producto para la comunidad Sabana'}
        </p>

        {apiError && (
          <div style={{ background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
            ⚠ {apiError}
          </div>
        )}

        <div className="card animate-fadeUp" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="input-group">
              <label className="input-label">Título del producto *</label>
              <input className="input-field" placeholder="Ej. Calculadora Casio FX-991" value={form.title} onChange={e => set('title', e.target.value)} maxLength={100} />
              {errors.title && <span className="input-error">{errors.title}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Descripción *</label>
              <textarea className="input-field" rows={4} placeholder="Describe el estado, uso, accesorios incluidos..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} maxLength={1000} />
              {errors.description && <span className="input-error">{errors.description}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Precio (COP) *</label>
                <input className="input-field" type="number" placeholder="Ej. 85000" value={form.price} onChange={e => set('price', e.target.value)} min={1} />
                {errors.price && <span className="input-error">{errors.price}</span>}
              </div>
              <div className="input-group">
                <label className="input-label">Categoría *</label>
                <select className="input-field" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                </select>
                {errors.category && <span className="input-error">{errors.category}</span>}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Estado del producto *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CONDITIONS.map(c => (
                  <button key={c.value} onClick={() => set('condition', c.value)} style={{ padding: '12px 8px', borderRadius: 'var(--radius-md)', border: form.condition === c.value ? '2px solid var(--navy)' : '1.5px solid var(--gray-200)', background: form.condition === c.value ? 'rgba(13,43,107,0.06)' : 'var(--white)', color: form.condition === c.value ? 'var(--navy)' : 'var(--gray-600)', fontSize: 13, fontWeight: form.condition === c.value ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {c.label}
                  </button>
                ))}
              </div>
              {errors.condition && <span className="input-error">{errors.condition}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Stock disponible *</label>
              <input
                className="input-field"
                type="number"
                min={1}
                placeholder="1"
                value={form.stock}
                onChange={e => set('stock', Math.max(1, parseInt(e.target.value) || 1))}
                style={{ maxWidth: 160 }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Imágenes (máx. 5 · JPG/PNG · máx 2MB c/u)</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '32px 20px', cursor: 'pointer', background: 'var(--gray-50)' }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>Subir imágenes</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>PNG, JPG hasta 2MB</span>
                <input type="file" multiple accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={handleImages} />
              </label>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {previews.map((url, i) => (
                    <div key={i} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-100)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button onClick={() => navigate(-1)} className="btn-outline" style={{ flex: 1, padding: 14 }}>Cancelar</button>
              <button onClick={handleSubmit} className="btn-primary" style={{ flex: 2, padding: 14 }} disabled={loading}>
                {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Publicar producto'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
