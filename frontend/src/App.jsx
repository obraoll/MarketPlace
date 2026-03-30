import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar'
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const TestLoginPage = lazy(() => import('./pages/TestLoginPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, authChecked } = useAuthStore()

  if (!authChecked) {
    return <p className="text-sm text-gray-500">Chargement session...</p>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
  }
  
  return children
}

/** Admin et vendeur n'ont accès qu'à leur dashboard : redirection depuis la home et la marketplace. */
function NoMarketplaceForAdminAndVendor({ children }) {
  const { user, authChecked } = useAuthStore()
  if (!authChecked) return <p className="text-sm text-gray-500">Chargement session...</p>
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (user?.role === 'vendeur') {
    return <Navigate to="/vendor/dashboard" replace />
  }
  return children
}

/** Après connexion, admin et vendeur sont redirigés directement vers leur dashboard. */
function HomeOrRedirectToDashboard({ children }) {
  const { user, isAuthenticated, authChecked } = useAuthStore()
  if (!authChecked) return <p className="text-sm text-gray-500">Chargement session...</p>
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (isAuthenticated && user?.role === 'vendeur') {
    return <Navigate to="/vendor/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Suspense fallback={<p className="text-sm text-gray-500">Chargement...</p>}>
        <Routes>
          <Route path="/" element={<HomeOrRedirectToDashboard><HomePage /></HomeOrRedirectToDashboard>} />
          <Route path="/test-login" element={<TestLoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={
            <HomeOrRedirectToDashboard>
              <RegisterPage />
            </HomeOrRedirectToDashboard>
          } />
          <Route path="/products" element={<NoMarketplaceForAdminAndVendor><ProductsPage /></NoMarketplaceForAdminAndVendor>} />
          <Route path="/products/:id" element={<NoMarketplaceForAdminAndVendor><ProductDetailPage /></NoMarketplaceForAdminAndVendor>} />
          <Route path="/wishlist" element={<NoMarketplaceForAdminAndVendor><WishlistPage /></NoMarketplaceForAdminAndVendor>} />
          <Route path="/compare" element={<NoMarketplaceForAdminAndVendor><ComparePage /></NoMarketplaceForAdminAndVendor>} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/cart" element={
            <NoMarketplaceForAdminAndVendor>
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            </NoMarketplaceForAdminAndVendor>
          } />
          <Route path="/orders" element={
            <NoMarketplaceForAdminAndVendor>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </NoMarketplaceForAdminAndVendor>
          } />
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute requiredRole="vendeur">
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />
        </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
