import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!email && !password) { setApiError('Email y contraseña son requeridos'); return false }
    if (!email) e.email = 'El correo es obligatorio'
    else if (!email.endsWith('@unisabana.edu.co')) e.email = 'Debe ser un correo institucional (@unisabana.edu.co)'
    if (!password) e.password = 'La contraseña es obligatoria'
    if (Object.keys(e).length) { setErrors(e); return false }
    return true
  }

  const handleSubmit = async () => {
    setApiError(''); setErrors({})
    if (!validate()) return
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) {
      if (res.status === 401) setApiError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      else if (res.status === 400) setApiError('Email y contraseña son requeridos.')
      else setApiError('Error del servidor. Intenta de nuevo.')
      return
    }
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: 'repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--white)' }}>Sabana </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
          </button>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Comparte e intercambia con tu comunidad</p>
        </div>

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Inicio de Sesión</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 28 }}>Ingresa y comienza a comprar ahora</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {apiError && (
              <div style={{ background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠ {apiError}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Correo institucional</label>
              <input className="input-field" type="email" placeholder="tu.nombre@unisabana.edu.co"
                value={email} onChange={e => { setEmail(e.target.value); setApiError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setApiError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>
            <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 18, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>¿No tienes cuenta? </span>
              <button onClick={() => navigate('/registro')} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Regístrate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
