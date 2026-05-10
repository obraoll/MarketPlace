import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI } from '../../services/api'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import { formatMoneyEUR } from './utils'

const conditionKey = {
  excellent: 'conditionExcellent',
  bon: 'conditionBon',
  correct: 'conditionCorrect',
}

function RelatedProductsRow({ productId, category }) {
  const { locale } = useLocaleStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    productsAPI
      .getAll({ category, limit: 8 })
      .then((res) => {
        if (cancelled) return
        const list = (res.data || []).filter((p) => p.id !== productId).slice(0, 8)
        setItems(list)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId, category])

  if (loading && items.length === 0) {
    return (
      <section className="mt-14 border-t border-gray-200/80 pt-10">
        <h2 className="mb-4 font-serif text-2xl font-bold text-gray-900">{t(locale, 'pdpRelatedTitle')}</h2>
        <p className="text-sm text-gray-500">{t(locale, 'pdpRelatedLoading')}</p>
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section className="mt-14 border-t border-gray-200/80 pt-10">
      <h2 className="mb-6 font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {t(locale, 'pdpRelatedTitle')}
      </h2>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((p) => {
          const cond = conditionKey[p.condition] ? t(locale, conditionKey[p.condition]) : p.condition
          const img = p.image_url || (Array.isArray(p.image_urls) && p.image_urls[0]) || ''
          return (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="snap-start shrink-0 w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                {img ? (
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                ) : (
                  <span className="text-4xl opacity-30" aria-hidden>
                    📱
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-500 line-clamp-2 font-medium leading-snug">{p.name}</p>
                <p className="text-[11px] text-gray-400 mt-1">{cond}</p>
                <p className="text-sm font-bold text-gray-900 mt-auto pt-2">{formatMoneyEUR(p.price, locale)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default RelatedProductsRow
