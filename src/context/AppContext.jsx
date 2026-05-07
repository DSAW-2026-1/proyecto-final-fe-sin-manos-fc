import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AppContext = createContext(null)

export const CATEGORIES = ['Todos', 'Libros', 'Electrónica', 'Útiles', 'Accesorios', 'Ropa', 'Deportes', 'Otros']

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión desde localStorage al recargar la página
  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.me().then(data => {
        if (data.userId) {
          const updated = { ...JSON.parse(saved), ...data }
          setUser(updated)
          localStorage.setItem('user', JSON.stringify(updated))
        }
      }).catch(() => {})
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.login({ email, password })
    if (!res.ok) return { ok: false, status: res.status, error: res.data.error }
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return { ok: true }
  }

  const register = async (data) => {
    const res = await api.register(data)
    if (!res.ok) return { ok: false, status: res.status, error: res.data.error, details: res.data.details }
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return { ok: true }
  }

  const logout = async () => {
    await api.logout().catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Refrescar usuario desde BD (después de publicar producto para obtener isSeller=true)
  const refreshUser = async () => {
    if (!user) return
    const data = await api.me()
    if (data.userId) {
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
    }
  }

  return (
    <AppContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {!loading && children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
