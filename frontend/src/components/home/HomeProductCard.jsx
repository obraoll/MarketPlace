import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const conditionKey = {
  excellent: 'conditionExcellent',
  bon: 'conditionBon',
  correct: 'conditionCorrect',
}

function HomeProductCard({ product, onAdded }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addToCart } = useCartStore()
  const { locale } = useLocaleStore()
  const condLabel = conditionKey[product.condition]
    ? t(locale, conditionKey[product.condition])
    : product.condition

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated || user?.role !== 'client') {
      navigate('/login')
      return
    }
    const ok = await addToCart(product.id, 1)
    if (ok && onAdded) onAdded()
  }

  return (
    <div className="snap-start shrink-0 w-[min(100%,280px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link to={`/products/${product.id}`} className="block flex-1 flex flex-col min-h-0">
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt=""
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-5xl opacity-40" aria-hidden>
              📱
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
          <p className="text-xs text-gray-400 mb-3">{condLabel}</p>
          <p className="text-lg font-bold text-gray-900 mt-auto">
            {Number(product.price).toFixed(2).replace('.', ',')} €
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        {isAuthenticated && user?.role === 'client' ? (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 rounded-xl border-2 border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          >
            + {t(locale, 'homeAddToCart')}
          </button>
        ) : (
          <Link
            to={`/products/${product.id}`}
            className="block text-center py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-900 transition-colors"
          >
            {t(locale, 'homeSeeProduct')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default HomeProductCard
