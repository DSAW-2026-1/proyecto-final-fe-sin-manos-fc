import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import NotificationBell from './NotificationBell'
import { API_URL } from '../config'

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const navLinks = user.role === 'admin'
    ? [
        { label: 'Catálogo',  path: '/home' },
        { label: 'Mensajes',  path: '/mensajes' },
        { label: 'Admin',     path: '/admin' },
        { label: 'Mi Perfil', path: '/perfil' },
      ]
    : [
        { label: 'Catálogo',   path: '/home' },
        { label: 'Mensajes',   path: '/mensajes' },
        { label: 'Mis Compras',path: '/compras' },
        ...(user.isSeller ? [{ label: 'Mis Ventas', path: '/mis-ventas' }] : []),
        { label: 'Mi Perfil',  path: '/perfil' },
      ]

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <nav style={{
      background: 'var(--navy-dark)',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 var(--page-px)',
        display: 'flex', alignItems: 'center',
        height: 'var(--nav-height)', gap: 24
      }}>
        {/* Logo */}
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>UniPlace</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>Market</span>
        </button>

        {/* Desktop links */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)} style={{
              background: location.pathname === l.path ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: location.pathname === l.path ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
              border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}>{l.label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Vender button */}
          {user.role !== 'admin' && (
            <button onClick={() => navigate('/crear-producto')} style={{
              background: 'var(--gold)', color: 'var(--navy-dark)',
              border: 'none', padding: '7px 14px', borderRadius: 'var(--radius-md)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              minHeight: 36
            }}>+ Vender</button>
          )}

          <NotificationBell />

          {/* Avatar / menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'var(--gold)', border: 'none', width: 36, height: 36,
              borderRadius: '50%', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {user.photoUrl
                ? <img src={`${API_URL}${user.photoUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : (user.name?.charAt(0) || 'U')}
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--white)', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)',
                  minWidth: 180, overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{user.email}</p>
                    <p style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, marginTop: 2 }}>{user.role === 'admin' ? 'Administrador' : user.isSeller ? 'Vendedor' : 'Comprador'}</p>
                  </div>
                  {[
                    { label: 'Mi perfil', action: () => { navigate('/perfil'); setMenuOpen(false) } },
                    { label: 'Mis compras', action: () => { navigate('/compras'); setMenuOpen(false) } },
                    ...(user.isSeller ? [{ label: 'Mis ventas', action: () => { navigate('/mis-ventas'); setMenuOpen(false) } }] : []),
                    ...(user.role !== 'admin' ? [{ label: 'Publicar producto', action: () => { navigate('/crear-producto'); setMenuOpen(false) } }] : []),
                  ].map(item => (
                    <button key={item.label} onClick={item.action} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--gray-600)', fontFamily: 'var(--font-body)' }}>
                      {item.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--danger)', fontFamily: 'var(--font-body)', borderTop: '1px solid var(--gray-100)' }}>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
