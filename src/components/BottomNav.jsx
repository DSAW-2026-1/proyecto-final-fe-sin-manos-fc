import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { icon: '🏠', label: 'Inicio',    path: '/home' },
  { icon: '🔍', label: 'Explorar', path: '/home' },
  { icon: '💬', label: 'Mensajes', path: '/mensajes' },
  { icon: '🛒', label: 'Compras',  path: '/compras' },
  { icon: '👤', label: 'Perfil',   path: '/perfil' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map(t => (
          <button
            key={t.path + t.label}
            className={`bottom-nav-btn${location.pathname === t.path && t.label !== 'Explorar' ? ' active' : ''}`}
            onClick={() => navigate(t.path)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
