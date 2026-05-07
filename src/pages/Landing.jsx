import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
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
      <footer style={{ background: 'var(--navy-dark)', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--white)', marginBottom: 8 }}>Sabana <span style={{ color: 'var(--gold)' }}>Market</span></p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Universidad de La Sabana © 2025</p>
      </footer>
    </div>
  )
}
