import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const { register } = useApp()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio'
    else if (form.name.trim().length < 4) e.name = 'Mínimo 4 caracteres'
    if (!form.email.trim()) e.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
    if (!form.password) e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    setApiError('')
    const res = await register({ name: form.name, email: form.email, password: form.password })
    setLoading(false)
    if (!res.ok) {
      if (res.status === 409) setApiError('Este correo ya está registrado.')
      else setApiError(res.error || 'Error del servidor.')
      return
    }
    setSuccessEmail(form.email)
  }

  if (successEmail) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--white)' }}>UniPlace </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
          </div>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', marginBottom: 8, textAlign: 'center' }}>Cuenta creada</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20, textAlign: 'center' }}>
              El usuario fue registrado correctamente. Para otorgar permisos de admin, pide al desarrollador que ejecute:
            </p>
            <div style={{ background: 'var(--navy-dark)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20 }}>
              <code style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                UPDATE users SET role='admin' WHERE email='{successEmail}';
              </code>
            </div>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', padding: 12 }}>
              Ir al login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: 'repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--white)' }}>UniPlace </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
        </div>

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Registro Admin</h2>
            <span className="badge badge-navy" style={{ fontSize: 10 }}>Admin</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Acceso restringido — solo para administradores</p>

          {apiError && (
            <div style={{ background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>⚠ {apiError}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Nombre completo</label>
              <input className="input-field" placeholder="Tu nombre" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <span className="input-error">{errors.name}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Correo electrónico</label>
              <input className="input-field" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => set('email', e.target.value)} />
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
            <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', padding: 14, marginTop: 4 }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
