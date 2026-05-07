import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import { Purchases, ConfirmPurchase, OrderSuccess } from './pages/Purchases'
import Mensajes from './pages/Mensajes'
import Perfil from './pages/Perfil'
import Cart from './pages/Cart'
import PublicPerfil from './pages/PublicPerfil'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useApp()
  return !user ? children : <Navigate to="/home" replace />
}

// Páginas donde NO mostramos BottomNav
const NO_BOTTOM_NAV = ['/', '/login', '/registro']

function Layout() {
  const { user } = useApp()
  const location = useLocation()
  const showBottom = user && !NO_BOTTOM_NAV.includes(location.pathname)

  return (
    <>
      <Routes>
        <Route path="/"               element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro"       element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/home"           element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/producto/:id"   element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/crear-producto" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        <Route path="/editar-producto"element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        <Route path="/compras"        element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/confirmar"      element={<ProtectedRoute><ConfirmPurchase /></ProtectedRoute>} />
        <Route path="/orden-exitosa"  element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/mensajes"       element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />
        <Route path="/perfil"         element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/carrito"        element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/vendedor/:userId" element={<ProtectedRoute><PublicPerfil /></ProtectedRoute>} />
        <Route path="*"               element={<Navigate to="/home" replace />} />
      </Routes>
      {showBottom && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  )
}
