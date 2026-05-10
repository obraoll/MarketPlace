import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import HorizontalSection from './HorizontalSection'
import HomeProductCard from './HomeProductCard'

function BestSellersRow({ products, loading, error, errorMessage }) {
  const { locale } = useLocaleStore()
  const sorted = [...(products || [])].sort((a, b) => Number(b.price) - Number(a.price))
  const list = sorted.slice(0, 12)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t(locale, 'bestSellersTitle')}</h2>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p className="font-semibold">{t(locale, 'homeProductsError')}</p>
          {errorMessage ? <p className="mt-1 text-xs leading-snug opacity-95">{errorMessage}</p> : null}
        </div>
      )}
      {loading && !list.length ? (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="w-64 h-96 bg-white rounded-2xl border animate-pulse shrink-0" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">{t(locale, 'homeNoProducts')}</p>
      ) : (
        <HorizontalSection>
          {list.map((p) => (
            <HomeProductCard key={`best-${p.id}`} product={p} />
          ))}
        </HorizontalSection>
      )}
    </section>
  )
}

export default BestSellersRow
