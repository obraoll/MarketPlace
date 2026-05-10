import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import HorizontalSection from './HorizontalSection'

const reviews = [
  {
    name: 'Christophe C.',
    textFr: 'Produit conforme, livraison rapide. Service réactif.',
    textEn: 'Product as described, fast delivery. Responsive service.',
    product: 'Casque sans fil',
    rating: 5,
  },
  {
    name: 'Marie L.',
    textFr: 'Très satisfaite, état impeccable pour du reconditionné.',
    textEn: 'Very happy, immaculate condition for refurbished.',
    product: 'Smartphone',
    rating: 5,
  },
  {
    name: 'David P.',
    textFr: 'Excellent rapport qualité-prix, je recommande.',
    textEn: 'Great value for money, I recommend.',
    product: 'Tablette',
    rating: 5,
  },
  {
    name: 'Sophie M.',
    textFr: 'Emballage soigné, produit testé et fonctionnel.',
    textEn: 'Careful packaging, product tested and working.',
    product: 'Montre connectée',
    rating: 5,
  },
]

function TestimonialsRow() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t(locale, 'testimonialsTitle')}</h2>
      <HorizontalSection gapClass="gap-5">
        {reviews.map((r, idx) => (
          <article
            key={idx}
            className="snap-start shrink-0 w-[min(100%,300px)] rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 text-white flex flex-col shadow-lg"
          >
            <div className="relative h-36 bg-gradient-to-br from-gray-700 to-gray-900 flex items-end p-4">
              <span className="absolute top-3 left-3 text-xs font-medium bg-white/95 text-gray-900 px-2 py-1 rounded-lg">
                {r.name}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-sm text-gray-200 line-clamp-4 leading-relaxed">
                {locale === 'en' ? r.textEn : r.textFr}
              </p>
              <p className="mt-3 text-xs text-white/80">
                {'★'.repeat(r.rating)} {r.rating}/5
              </p>
            </div>
            <div className="bg-white text-gray-900 p-3 text-xs font-medium border-t border-gray-100">
              {r.product}
            </div>
          </article>
        ))}
      </HorizontalSection>
    </section>
  )
}

export default TestimonialsRow
