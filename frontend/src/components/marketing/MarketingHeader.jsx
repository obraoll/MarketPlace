import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const categories = [
  { fr: 'Bons plans', en: 'Deals', to: '/products', accent: true },
  { fr: 'Smartphones', en: 'Smartphones', to: '/products?category=smartphone' },
  { fr: 'Ordinateurs', en: 'Laptops', to: '/products?category=ordinateur' },
  { fr: 'Tablettes', en: 'Tablets', to: '/products?category=tablette' },
  { fr: 'Consoles', en: 'Consoles', to: '/products?category=console' },
  { fr: 'Montres', en: 'Watches', to: '/products?category=montre' },
  { fr: 'Audio', en: 'Audio', to: '/products?category=ecouteurs' },
  { fr: 'Autre', en: 'Other', to: '/products?category=autre' },
]

function LogoMark() {
  return (
    <span className="flex items-center gap-1 text-gray-900" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M8 6l4 4 4-4M8 18l4-4 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function MarketingHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items, fetchCart } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const hydrateWishlist = useWishlistStore((s) => s.hydrate)
  const { locale, setLocale } = useLocaleStore()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  useEffect(() => {
    hydrateWishlist()
  }, [isAuthenticated, hydrateWishlist])

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  const onSearch = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) {
      navigate(`/products?search=${encodeURIComponent(term)}`)
    } else {
      navigate('/products')
    }
  }

  const homeTo = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'vendeur' ? '/vendor/dashboard' : '/'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="bg-surface-muted border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-gray-700">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/help" className="hover:text-gray-900 hover:underline">
              {t(locale, 'navQuality')}
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <Link to="/help" className="hover:text-gray-900 hover:underline">
              {t(locale, 'navRepair')}
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <Link to="/help" className="hover:text-gray-900 hover:underline">
              {t(locale, 'navMag')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base leading-none" aria-hidden>
              🇫🇷
            </span>
            <select
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <Link
            to={homeTo}
            className="flex items-center gap-2 shrink-0 font-bold text-lg text-gray-900 tracking-tight"
          >
            <LogoMark />
            {t(locale, 'marketplace')}
          </Link>

          <form
            onSubmit={onSearch}
            className="flex-1 flex justify-center w-full lg:max-w-xl lg:mx-auto order-3 lg:order-none"
          >
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t(locale, 'navSearchExample')}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-muted border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none text-sm text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0 order-2 lg:order-none">
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01"
                />
              </svg>
              {t(locale, 'navSell')}
            </Link>
            <Link to="/help" className="hidden md:inline text-sm text-gray-600 hover:text-gray-900">
              {t(locale, 'navNeedHelp')} ?
            </Link>
            <span className="hidden lg:inline text-sm text-gray-600">{t(locale, 'navEnterprise')}</span>

            <Link
              to="/products"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900 px-2"
            >
              {t(locale, 'products')}
            </Link>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              title={t(locale, 'account')}
            >
              <span className="sr-only">{t(locale, 'account')}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>

            <Link
              to="/wishlist"
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 relative"
              title={t(locale, 'wishlist')}
            >
              <span className="sr-only">{t(locale, 'wishlist')}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[1.1rem] h-4 px-1 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user?.role === 'client' && (
              <Link
                to="/cart"
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 relative"
                title={t(locale, 'cart')}
              >
                <span className="sr-only">{t(locale, 'cart')}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">
                    {t(locale, 'orders')}
                  </Link>
                )}
                <Link to="/compare" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">
                  {t(locale, 'compare')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:border-gray-400"
                >
                  {t(locale, 'logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:border-gray-400"
                >
                  {t(locale, 'login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gray-900 text-white rounded-lg px-3 py-2 hover:bg-gray-800"
                >
                  {t(locale, 'register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 text-sm font-medium text-gray-800"
            aria-label="Catégories"
          >
            {categories.map((c) => {
              const label = locale === 'en' ? c.en : c.fr
              return (
                <Link
                  key={c.to + label}
                  to={c.to}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${
                    c.accent
                      ? 'text-brand-accentPink font-semibold'
                      : 'hover:bg-surface-muted'
                  }`}
                >
                  {c.accent && <span className="mr-1">✨</span>}
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default MarketingHeader
