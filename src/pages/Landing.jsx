import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [adminModal, setAdminModal] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const clickTimesRef = useRef([])

  useEffect(() => {
    if (!adminModal) return
    const onKey = (e) => { if (e.key === 'Escape') { setAdminModal(false); setAdminPass(''); setAdminError(''); setAdminUnlocked(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [adminModal])

  const handleSecretClick = () => {
    const now = Date.now()
    clickTimesRef.current = [...clickTimesRef.current.filter(t => now - t < 2000), now]
    if (clickTimesRef.current.length >= 3) {
      clickTimesRef.current = []
      setAdminModal(true)
      setAdminPass('')
      setAdminError('')
      setAdminUnlocked(false)
    }
  }

  const handleAdminEnter = () => {
    if (adminPass === 'USabana2025Admin') {
      setAdminUnlocked(true)
    } else {
      setAdminError('Clave incorrecta')
    }
  }

  const closeAdminModal = () => { setAdminModal(false); setAdminPass(''); setAdminError(''); setAdminUnlocked(false) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      {/* Nav */}
      <header style={{ background: 'var(--navy-dark)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>Sabana </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#acerca" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Acerca de</a>
          <a href="#vendedores" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Para vendedores</a>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Inicio Sesión</button>
          <button onClick={() => navigate('/registro')} className="btn-gold" style={{ padding: '8px 20px', fontSize: 13 }}>Registrarse</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'var(--navy-dark)', padding: '80px 40px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', opacity: 0.15, background: 'radial-gradient(circle at 70% 50%, var(--gold) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="animate-fadeUp">
            <div className="badge badge-gold" style={{ marginBottom: 20 }}>Universidad de La Sabana</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--white)', lineHeight: 1.15, marginBottom: 20 }}>
              Explora las ideas y los productos de hoy
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              El marketplace universitario donde estudiantes compran, venden e intercambian dentro de la comunidad Sabana.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navigate('/login')} className="btn-outline" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}>Iniciar sesión</button>
              <button onClick={() => navigate('/registro')} className="btn-gold">Registrarse</button>
            </div>
          </div>
          {/* Mock product preview */}
          <div className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)', padding: 24, backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Nombre Producto', price: '$50.000', color: '#C9A84C' },
                  { label: 'Nombre Producto', price: '$120.000', color: '#1A3A7C' },
                  { label: 'Nombre Producto', price: '$75.000', color: '#C9A84C' },
                  { label: 'Nombre Producto', price: '$95.000', color: '#1A3A7C' },
                ].map((p, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ height: 80, background: p.color, opacity: 0.8 }} />
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: 2 }}>{p.label}</p>
                      <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>500+</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>productos</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>1.2k</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>estudiantes</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>4.8★</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>valoración</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding: '80px 40px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--navy)', textAlign: 'center', marginBottom: 12 }}>Cómo funciona</h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 48, fontSize: 15 }}>En tres pasos ya puedes comprar o vender dentro de la comunidad Sabana</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { step: '01', icon: '📧', title: 'Regístrate', desc: 'Crea tu cuenta con tu correo institucional @unisabana.edu.co' },
              { step: '02', icon: '📦', title: 'Publica o encuentra', desc: 'Sube tus productos en segundos o explora el catálogo de la comunidad' },
              { step: '03', icon: '🤝', title: 'Compra seguro', desc: 'Coordina con el vendedor dentro del campus con total confianza' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 32, border: '1px solid var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--navy)', opacity: 0.06 }}>{step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías populares */}
      <section style={{ padding: '80px 40px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--navy)', textAlign: 'center', marginBottom: 12 }}>Categorías populares</h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 48, fontSize: 15 }}>Encuentra lo que buscas en nuestra comunidad</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {[
              { icon: '📚', label: 'Libros y apuntes' },
              { icon: '💻', label: 'Tecnología' },
              { icon: '🎒', label: 'Útiles' },
              { icon: '👕', label: 'Ropa' },
              { icon: '🎮', label: 'Entretenimiento' },
              { icon: '🏠', label: 'Hogar' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '24px 12px', border: '1px solid var(--gray-100)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-pale)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.background = 'var(--gray-50)' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Por qué UniPlace Market? */}
      <section style={{ padding: '80px 40px', background: 'var(--navy-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--white)', textAlign: 'center', marginBottom: 12 }}>¿Por qué UniPlace Market?</h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', marginBottom: 48, fontSize: 15 }}>Diseñado para la comunidad Sabana, por la comunidad Sabana</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { icon: '🔒', title: 'Solo estudiantes Unisabana', desc: 'Acceso exclusivo con correo @unisabana.edu.co' },
              { icon: '⚡', title: 'Transacciones rápidas', desc: 'Coordina entregas dentro del campus al instante' },
              { icon: '💬', title: 'Chat directo', desc: 'Habla con el vendedor sin intermediarios' },
              { icon: '⭐', title: 'Sistema de reputación', desc: 'Reseñas reales de la comunidad universitaria' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', padding: 28, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acerca de */}
      <section id="acerca" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Acerca de Sabana Market</h2>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 16 }}>Un espacio de confianza para la comunidad universitaria. Compra y vende dentro del campus con la seguridad de que tratas con compañeros.</p>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>Desde libros y útiles hasta electrónica y accesorios, encuentra todo lo que necesitas para tu vida universitaria al mejor precio.</p>
          </div>
          <div id="vendedores">
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', padding: 32, border: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--navy)', marginBottom: 20 }}>Para Vendedores</h3>
              {['Publica en segundos', 'Conecta con compradores', 'Gestiona tus ventas', 'Chat directo integrado'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--gold)' }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/registro')} className="btn-primary" style={{ width: '100%', marginTop: 8 }}>Empezar a vender</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--navy-dark)', padding: '32px 40px', textAlign: 'center', position: 'relative' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>UniPlace Market © 2026 · Universidad de La Sabana</p>
        <button
          onClick={handleSecretClick}
          aria-hidden="true"
          style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, background: 'transparent', border: 'none', cursor: 'default', padding: 0, outline: 'none' }}
        />
      </footer>

      {/* Modal: Acceso Administrador */}
      {adminModal && (
        <>
          <div onClick={closeAdminModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 28, width: '90%', maxWidth: 380, zIndex: 1000, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)' }}>Acceso Administrador</h3>
              <button onClick={closeAdminModal} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--gray-400)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>✕</button>
            </div>
            {adminUnlocked ? (
              <>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20 }}>¿Qué deseas hacer?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => navigate('/registro-admin')} className="btn-gold" style={{ width: '100%', padding: 12 }}>Crear cuenta admin</button>
                  <button onClick={() => navigate('/login')} className="btn-outline" style={{ width: '100%', padding: 12 }}>Iniciar sesión</button>
                </div>
              </>
            ) : (
              <>
                <div className="input-group" style={{ marginBottom: 16 }}>
                  <label className="input-label">Clave de acceso</label>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={adminPass}
                    onChange={e => { setAdminPass(e.target.value); setAdminError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdminEnter() }}
                    autoFocus
                  />
                  {adminError && <span className="input-error">{adminError}</span>}
                </div>
                <button onClick={handleAdminEnter} className="btn-primary" style={{ width: '100%', padding: 12 }}>Ingresar</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
