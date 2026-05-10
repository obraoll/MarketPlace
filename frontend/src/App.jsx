import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar'
import MarketingHeader from './components/marketing/MarketingHeader'
import SiteFooter from './components/marketing/SiteFooter'
import { t } from './i18n'
import { useLocaleStore } from './stores/localeStore'

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

  if (!authChecked) return <SessionLoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

function NoMarketplaceForAdminAndVendor({ children }) {
  const { user, authChecked } = useAuthStore()
  if (!authChecked) return <SessionLoadingScreen />
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (user?.role === 'vendeur') {
    return <Navigate to="/vendor/dashboard" replace />
  }
  return children
}

function SessionLoadingScreen() {
  return (
    <div className="flex min-h-[45vh] w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="mb-5 h-11 w-11 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-base font-semibold text-gray-900">Chargement…</p>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Connexion au serveur (port 8000). Patientez quelques secondes.
      </p>
    </div>
  )
}

function HomeOrRedirectToDashboard({ children }) {
  const { user, isAuthenticated, authChecked } = useAuthStore()
  if (!authChecked) return <SessionLoadingScreen />
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (isAuthenticated && user?.role === 'vendeur') {
    return <Navigate to="/vendor/dashboard" replace />
  }
  return children
}

function App() {
  const location = useLocation()
  const { locale } = useLocaleStore()
  const isDashboardRoute =
    location.pathname.startsWith('/vendor/dashboard') ||
    location.pathname.startsWith('/admin/dashboard')

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      {isDashboardRoute ? <Navbar /> : <MarketingHeader />}
      <main
        className={
          isDashboardRoute
            ? 'flex-1 w-full max-w-7xl mx-auto px-6 py-10'
            : 'flex-1 w-full px-0 py-0 sm:py-2'
        }
      >
        <Suspense fallback={<p className="text-sm text-gray-500 px-4 py-8">{t(locale, 'loading')}</p>}>
          <Routes>
            <Route
              path="/"
              element={
                <HomeOrRedirectToDashboard>
                  <HomePage />
                </HomeOrRedirectToDashboard>
              }
            />
            <Route path="/test-login" element={<TestLoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/register"
              element={
                <HomeOrRedirectToDashboard>
                  <RegisterPage />
                </HomeOrRedirectToDashboard>
              }
            />
            <Route
              path="/products"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <ProductsPage />
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route
              path="/products/:id"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <ProductDetailPage />
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route
              path="/wishlist"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <WishlistPage />
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route
              path="/compare"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <ComparePage />
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route
              path="/cart"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route
              path="/orders"
              element={
                <NoMarketplaceForAdminAndVendor>
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                </NoMarketplaceForAdminAndVendor>
              }
            />
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute requiredRole="vendeur">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isDashboardRoute && <SiteFooter />}
    </div>
  )
}

export default App
