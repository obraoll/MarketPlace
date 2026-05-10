import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import HorizontalSection from './HorizontalSection'
import HomeProductCard from './HomeProductCard'

const chips = [
  { fr: 'Promos', en: 'Deals', to: '/products' },
  { fr: 'Smartphones', en: 'Phones', to: '/products?category=smartphone' },
  { fr: 'Ordinateurs', en: 'Laptops', to: '/products?category=ordinateur' },
  { fr: 'Audio', en: 'Audio', to: '/products?category=ecouteurs' },
]

function OffersSplitSection({ products, loading, error, errorMessage }) {
  const { locale } = useLocaleStore()
  const list = (products || []).slice(0, 10)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t(locale, 'offersTitle')}</h2>
      <div className="rounded-3xl bg-surface-muted border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[320px]">
        <div className="lg:w-[38%] min-h-[220px] bg-gradient-to-br from-emerald-100/80 to-teal-100/80 flex items-center justify-center p-8">
          <div className="text-center">
            <span className="text-6xl mb-2 block" aria-hidden>
              🎾
            </span>
            <p className="text-sm font-medium text-gray-700 max-w-[200px]">
              {locale === 'en' ? 'Quality refurbished, ready to go.' : 'Du reconditionné prêt à l’emploi.'}
            </p>
          </div>
        </div>
        <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0">
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-lime/80 text-gray-900 hover:bg-brand-lime border border-gray-900/10"
              >
                {locale === 'en' ? c.en : c.fr}
              </Link>
            ))}
          </div>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <p className="font-semibold">{t(locale, 'homeProductsError')}</p>
              {errorMessage ? <p className="mt-1 text-xs leading-snug opacity-95">{errorMessage}</p> : null}
            </div>
          )}
          {loading && !list.length ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map((k) => (
                <div key={k} className="w-64 h-80 bg-white rounded-2xl animate-pulse shrink-0" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">{t(locale, 'homeNoProducts')}</p>
          ) : (
            <HorizontalSection>
              {list.map((p) => (
                <HomeProductCard key={p.id} product={p} />
              ))}
            </HorizontalSection>
          )}
        </div>
      </div>
    </section>
  )
}

export default OffersSplitSection
