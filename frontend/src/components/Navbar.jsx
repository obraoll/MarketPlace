import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useVendorDashboardStore } from '../stores/vendorDashboardStore'
import { useEffect } from 'react'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'

const navLinkClass = 'text-sm text-gray-600 hover:text-gray-900 transition-colors'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items, fetchCart } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const hydrateWishlist = useWishlistStore((s) => s.hydrate)
  const { globalSearch, setGlobalSearch, pendingOrdersCount } = useVendorDashboardStore()
  const { locale, setLocale } = useLocaleStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  useEffect(() => {
    hydrateWishlist()
  }, [isAuthenticated, hydrateWishlist])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'vendeur' ? '/vendor/dashboard' : '/'}
            className={`${navLinkClass} font-medium flex items-center gap-2`}
          >
            <span className="text-lg">🛒</span>
            <span>{t(locale, 'marketplace')}</span>
          </Link>

          <div className="flex items-center gap-8">
            {user?.role === 'client' && (
              <>
                <Link to="/products" className={navLinkClass}>{t(locale, 'products')}</Link>
                <Link to="/compare" className={navLinkClass}>{t(locale, 'compare')}</Link>
                <Link to="/wishlist" className={`${navLinkClass} relative`}>
                  {t(locale, 'wishlist')}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/products" className={navLinkClass}>{t(locale, 'products')}</Link>
                <Link to="/compare" className={navLinkClass}>{t(locale, 'compare')}</Link>
                <Link to="/wishlist" className={`${navLinkClass} relative`}>
                  {t(locale, 'wishlist')}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link to="/orders" className={navLinkClass}>{t(locale, 'orders')}</Link>
                )}

                {user?.role === 'vendeur' && (
                  <>
                    <input
                      type="search"
                      placeholder={t(locale, 'searchPlaceholder')}
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      className="w-44 py-1.5 px-3 rounded border border-gray-200 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-1.5 rounded ${navLinkClass}`}
                        title={t(locale, 'notifications')}
                      >
                        <span className="text-base">🔔</span>
                        {pendingOrdersCount > 0 && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 top-full mt-1 w-56 rounded border border-gray-200 bg-white py-2 shadow-sm z-50">
                          <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide">{t(locale, 'notifications')}</p>
                          {pendingOrdersCount > 0 ? (
                            <p className="px-3 py-1 text-sm text-gray-700">{pendingOrdersCount} {t(locale, 'pendingOrders')}</p>
                          ) : (
                            <p className="px-3 py-1 text-sm text-gray-500">{t(locale, 'noNotifications')}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <Link to="/vendor/dashboard" className={navLinkClass}>Ma Marketplace</Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className={navLinkClass}>Administration</Link>
                )}

                {user?.role === 'client' && (
                  <Link to="/cart" className={`${navLinkClass} relative`}>
                    {t(locale, 'cart')}
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                )}

                <Link to="/account" className={navLinkClass}>{t(locale, 'account')}</Link>

                <span className="text-sm text-gray-500">{user?.first_name} {user?.last_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 hover:border-gray-400 transition-colors"
                >
                  {t(locale, 'logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 hover:border-gray-400 transition-colors">
                  {t(locale, 'login')}
                </Link>
                <Link to="/register" className="text-sm text-white bg-gray-800 hover:bg-gray-900 rounded px-3 py-1.5 transition-colors">
                  {t(locale, 'register')}
                </Link>
                <Link to="/help" className={navLinkClass}>{t(locale, 'help')}</Link>
                <Link to="/legal" className={navLinkClass}>{t(locale, 'legal')}</Link>
              </>
            )}
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              aria-label="Langue"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
