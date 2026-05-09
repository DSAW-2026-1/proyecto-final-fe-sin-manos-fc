import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { api } from '../../api'

const TABS = ['Usuarios', 'Productos', 'Reportes']

export default function AdminDashboard() {
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const [suspendModal, setSuspendModal] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dash, usrs, prods, reps] = await Promise.all([
        api.getDashboard(),
        api.getAdminUsers(),
        api.getProducts(),
        api.getAdminReports(),
      ])
      setStats(dash)
      setUsers(Array.isArray(usrs) ? usrs : [])
      const prodList = prods?.products ?? prods
      setProducts(Array.isArray(prodList) ? prodList : [])
      setReports(Array.isArray(reps) ? reps : [])
    } finally {
      setLoading(false)
    }
  }

  const refreshUsers = async () => {
    const usrs = await api.getAdminUsers()
    setUsers(Array.isArray(usrs) ? usrs : [])
  }

  const refreshProducts = async () => {
    const prods = await api.getProducts()
    const prodList = prods?.products ?? prods
    setProducts(Array.isArray(prodList) ? prodList : [])
  }

  const refreshReports = async () => {
    const reps = await api.getAdminReports()
    setReports(Array.isArray(reps) ? reps : [])
  }

  const handleSuspend = async () => {
    setActionLoading(true)
    await api.suspendUser(suspendModal.user.id, !suspendModal.user.suspended, suspendReason)
    setActionLoading(false)
    setSuspendModal(null)
    setSuspendReason('')
    refreshUsers()
  }

  const handleDeleteProduct = async () => {
    setActionLoading(true)
    await api.deleteProductAdmin(deleteModal.product.id, deleteReason)
    setActionLoading(false)
    setDeleteModal(null)
    setDeleteReason('')
    refreshProducts()
  }

  const handleUpdateReport = async (reportId, status) => {
    await api.updateReport(reportId, status)
    refreshReports()
  }

  const statCards = [
    { label: 'Total Usuarios', value: stats?.totalUsers ?? '—', icon: '👥' },
    { label: 'Productos Activos', value: stats?.activeProducts ?? '—', icon: '📦' },
    { label: 'Reportes Pendientes', value: stats?.pendingReports ?? '—', icon: '🚩' },
    { label: 'Total Órdenes', value: stats?.totalOrders ?? '—', icon: '🛒' },
  ]

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>Panel de Administración</h1>
            <span className="badge badge-navy" style={{ fontSize: 11 }}>Admin</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Gestiona usuarios, productos y reportes de la plataforma</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {statCards.map(({ label, value, icon }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--gray-100)', marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              background: 'none', border: 'none', padding: '10px 24px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              color: tab === i ? 'var(--navy)' : 'var(--gray-400)',
              borderBottom: tab === i ? '2px solid var(--navy)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s'
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Cargando...</div>
        ) : (
          <>
            {/* Tab Usuarios */}
            {tab === 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
                      {['Nombre', 'Email', 'Rol', 'Estado', 'Registro', 'Acción'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                        <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{u.name}</td>
                        <td style={{ padding: '13px 14px', fontSize: 12, color: 'var(--gray-600)' }}>{u.email}</td>
                        <td style={{ padding: '13px 14px' }}>
                          <span className="badge badge-navy" style={{ fontSize: 10 }}>{u.role || 'user'}</span>
                        </td>
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: u.suspended ? '#FDECEA' : '#E6F4EC', color: u.suspended ? 'var(--danger)' : 'var(--success)' }}>
                            {u.suspended ? 'Suspendido' : 'Activo'}
                          </span>
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 12, color: 'var(--gray-400)' }}>
                          {new Date(u.createdAt || u.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 14px' }}>
                          <button onClick={() => { setSuspendModal({ user: u }); setSuspendReason('') }} style={{
                            background: u.suspended ? 'var(--success)' : 'var(--danger)',
                            color: 'var(--white)', border: 'none', padding: '6px 14px',
                            borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
                            fontFamily: 'var(--font-body)', fontWeight: 600
                          }}>
                            {u.suspended ? 'Reactivar' : 'Suspender'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)', fontSize: 13 }}>No hay usuarios registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab Productos */}
            {tab === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)', fontSize: 13 }}>No hay productos</div>
                )}
                {products.map(p => (
                  <div key={p.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 24 }}>📦</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Vendedor: {p.seller?.name || '—'} · ${Number(p.price).toLocaleString('es-CO')}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, flexShrink: 0, background: p.status === 'sold' ? '#FDECEA' : '#E6F4EC', color: p.status === 'sold' ? 'var(--danger)' : 'var(--success)' }}>
                      {p.status === 'sold' ? 'Vendido' : 'Activo'}
                    </span>
                    <button onClick={() => { setDeleteModal({ product: p }); setDeleteReason('') }} style={{
                      background: 'var(--danger)', color: 'var(--white)', border: 'none',
                      padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, flexShrink: 0
                    }}>Eliminar</button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Reportes */}
            {tab === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reports.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)', fontSize: 13 }}>No hay reportes pendientes</div>
                )}
                {reports.map(r => (
                  <div key={r.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
                          {r.reporter?.name || r.reporterName || 'Usuario'} reportó un {r.targetType || 'ítem'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--gray-600)' }}>Motivo: <strong style={{ color: 'var(--navy)' }}>{r.reason}</strong></p>
                        {r.description && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.5 }}>{r.description}</p>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#FEF3CD', color: '#856404', flexShrink: 0, marginLeft: 16 }}>
                        {r.status || 'pendiente'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
                      <button onClick={() => handleUpdateReport(r.id, 'reviewing')} style={{ background: 'var(--navy)', color: 'var(--white)', border: 'none', padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Revisar</button>
                      <button onClick={() => handleUpdateReport(r.id, 'actioned')} style={{ background: 'var(--danger)', color: 'var(--white)', border: 'none', padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Tomar acción</button>
                      <button onClick={() => handleUpdateReport(r.id, 'dismissed')} style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Descartar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Suspender / Reactivar */}
      {suspendModal && (
        <>
          <div onClick={() => setSuspendModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 28, width: '90%', maxWidth: 420, zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', marginBottom: 8 }}>
              {suspendModal.user.suspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20 }}>
              {suspendModal.user.suspended
                ? `¿Reactivar la cuenta de ${suspendModal.user.name}?`
                : `¿Suspender la cuenta de ${suspendModal.user.name}?`}
            </p>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Motivo {suspendModal.user.suspended ? '(opcional)' : '*'}</label>
              <textarea className="input-field" rows={3} placeholder="Describe el motivo..." value={suspendReason} onChange={e => setSuspendReason(e.target.value)} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSuspendModal(null)} className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleSuspend} disabled={actionLoading} style={{
                flex: 1, background: suspendModal.user.suspended ? 'var(--success)' : 'var(--danger)',
                color: 'var(--white)', border: 'none', padding: '11px 0',
                borderRadius: 'var(--radius-md)', fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600
              }}>
                {actionLoading ? 'Procesando...' : suspendModal.user.suspended ? 'Reactivar' : 'Suspender'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Eliminar producto */}
      {deleteModal && (
        <>
          <div onClick={() => setDeleteModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 28, width: '90%', maxWidth: 420, zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--navy)', marginBottom: 8 }}>Eliminar producto</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20 }}>
              ¿Eliminar <strong>"{deleteModal.product.title}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Motivo *</label>
              <textarea className="input-field" rows={3} placeholder="Describe el motivo de la eliminación..." value={deleteReason} onChange={e => setDeleteReason(e.target.value)} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleDeleteProduct} disabled={actionLoading} style={{
                flex: 1, background: 'var(--danger)', color: 'var(--white)', border: 'none',
                padding: '11px 0', borderRadius: 'var(--radius-md)', fontSize: 14,
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600
              }}>
                {actionLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
