import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const brands = ['AP', 'SA', 'DY', 'NK', 'GO', 'NT']

function BrandStrip() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-3xl bg-surface-muted border border-gray-100 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t(locale, 'brandsTitle')}</h2>
        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-10">
          {brands.map((b) => (
            <div key={b} className="flex flex-col items-center gap-2 w-20">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-800 shadow-sm">
                {b}
              </div>
              <span className="text-[10px] text-gray-500 text-center leading-tight">Brand</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            {t(locale, 'brandsMore')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BrandStrip
