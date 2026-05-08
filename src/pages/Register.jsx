import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CarreraSelector from '../components/CarreraSelector'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', carrera: '' })
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoError, setFotoError] = useState('')
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useApp()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    else if (form.name.trim().length < 4) e.name = 'Mínimo 4 caracteres'
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(form.name.trim())) e.name = 'Solo se permiten letras, espacios, tildes y ñ'
    if (!form.email) e.email = 'El correo es obligatorio'
    else if (!form.email.endsWith('@unisabana.edu.co')) e.email = 'Debe ser un correo institucional (@unisabana.edu.co)'
    if (!form.password) e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    else if (!/\d/.test(form.password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password))
      e.password = 'Debe incluir al menos un número y un carácter especial'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    return e
  }

  const validateName = (v) => {
    const t = v.trim()
    if (!t) return 'El nombre es obligatorio'
    if (t.length < 4) return 'Mínimo 4 caracteres'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(t)) return 'Solo se permiten letras, espacios, tildes y ñ'
    return ''
  }

  const handleNext = () => {
    setAttempted(true)
    const e = validateStep1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setStep(2)
  }

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setFotoError('Solo JPG o PNG'); return }
    if (file.size > 2 * 1024 * 1024) { setFotoError('La foto no puede superar 2MB'); return }
    setFotoError('')
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (skip = false) => {
    if (fotoError) return
    setLoading(true); setApiError('')

    // 1. Registrar usuario
    const res = await register({ name: form.name, email: form.email, password: form.password, career: form.carrera })
    if (!res.ok) {
      if (res.status === 409) setApiError('Este correo ya está registrado.')
      else if (res.details) setApiError(res.details.join('. '))
      else setApiError(res.error || 'Error del servidor.')
      setLoading(false); setStep(1); return
    }

    // 2. Si hay foto o carrera, actualizar perfil inmediatamente
    if (!skip && (fotoFile || form.carrera)) {
      const token = localStorage.getItem('token')
      const userId = JSON.parse(localStorage.getItem('user'))?.userId
      if (userId && token) {
        const fd = new FormData()
        if (form.carrera) fd.append('career', form.carrera)
        if (fotoFile) fd.append('photo', fotoFile)
        await fetch(`http://localhost:4000/api/users/${userId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        })
      }
    }

    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: 'repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--white)' }}>UniPlace </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
          </button>
        </div>

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: s < 2 ? 1 : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? 'var(--navy)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: step >= s ? 'var(--white)' : 'var(--gray-400)' }}>{s}</span>
                </div>
                {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--navy)' : 'var(--gray-100)', borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          {apiError && (
            <div style={{ background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>⚠ {apiError}</div>
          )}

          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Registrarse</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Crea tu cuenta con correo institucional</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Nombre completo</label>
                  <input className="input-field" placeholder="Tu nombre" value={form.name} onChange={e => {
                    const v = e.target.value
                    set('name', v)
                    if (attempted) {
                      const err = validateName(v)
                      setErrors(prev => { const n = { ...prev }; if (err) n.name = err; else delete n.name; return n })
                    }
                  }} />
                  {errors.name && <span className="input-error">{errors.name}</span>}
                </div>
                <div className="input-group">
                  <label className="input-label">Correo institucional</label>
                  <input className="input-field" type="email" placeholder="tu.nombre@unisabana.edu.co" value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <span className="input-error">{errors.email}</span>}
                </div>
                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <input className="input-field" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => set('password', e.target.value)} />
                  {errors.password && <span className="input-error">{errors.password}</span>}
                </div>
                <div className="input-group">
                  <label className="input-label">Confirmar contraseña</label>
                  <input className="input-field" type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
                </div>
                <button onClick={handleNext} className="btn-primary" style={{ width: '100%', padding: 14, marginTop: 4 }}>Siguiente</button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>¿Ya tienes cuenta? </span>
                  <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Inicia sesión</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Completa tu perfil</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Foto y carrera (opcionales)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

                {/* Foto */}
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: fotoPreview ? 'transparent' : 'var(--gold-pale)', border: fotoError ? '3px dashed var(--danger)' : '3px dashed var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {fotoPreview
                      ? <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ fontSize: 28 }}>📷</span><span style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>Subir foto</span></div>
                    }
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>JPG o PNG · máx 2MB</span>
                  {fotoError && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{fotoError}</span>}
                  <input type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={handleFoto} />
                </label>

                {/* Carrera selector */}
                <div className="input-group" style={{ width: '100%' }}>
                  <label className="input-label">Programa académico (opcional)</label>
                  <CarreraSelector value={form.carrera} onChange={v => set('carrera', v)} />
                </div>

                <button onClick={() => handleSubmit(false)} className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading || !!fotoError}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
                <button onClick={() => handleSubmit(true)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }} disabled={loading}>
                  Omitir por ahora
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
