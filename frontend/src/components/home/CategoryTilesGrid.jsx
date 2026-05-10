import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const tiles = [
  { labelFr: 'Bons plans', labelEn: 'Deals', to: '/products', emoji: '✨', accent: true },
  { labelFr: 'Smartphones', labelEn: 'Smartphones', to: '/products?category=smartphone', emoji: '📱' },
  { labelFr: 'Ordinateurs', labelEn: 'Laptops', to: '/products?category=ordinateur', emoji: '💻' },
  { labelFr: 'Tablettes', labelEn: 'Tablets', to: '/products?category=tablette', emoji: '📲' },
  { labelFr: 'Consoles', labelEn: 'Consoles', to: '/products?category=console', emoji: '🎮' },
  { labelFr: 'Écouteurs', labelEn: 'Audio', to: '/products?category=ecouteurs', emoji: '🎧' },
  { labelFr: 'Montres', labelEn: 'Watches', to: '/products?category=montre', emoji: '⌚' },
  { labelFr: 'Autre', labelEn: 'Other', to: '/products?category=autre', emoji: '📦' },
]

function CategoryTilesGrid() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t(locale, 'catGridTitle')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {tiles.map((tile) => {
          const label = locale === 'en' ? tile.labelEn : tile.labelFr
          return (
            <Link
              key={tile.to + tile.labelFr}
              to={tile.to}
              className={`group rounded-3xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] hover:shadow-lg ${
                tile.accent ? 'bg-brand-lime ring-2 ring-pink-400/40' : 'bg-brand-lime'
              }`}
            >
              <span className="text-5xl mb-3 drop-shadow-sm filter group-hover:scale-105 transition-transform">
                {tile.emoji}
              </span>
              <span
                className={`font-bold text-sm ${tile.accent ? 'text-brand-accentPink' : 'text-gray-900'}`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default CategoryTilesGrid
