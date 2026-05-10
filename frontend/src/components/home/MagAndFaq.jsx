import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import HorizontalSection from './HorizontalSection'

const articles = [
  { catFr: 'Le Mag', catEn: 'The Mag', titleFr: 'Guide du reconditionné', titleEn: 'Refurbished guide' },
  { catFr: 'Le Mag', catEn: 'The Mag', titleFr: 'Réduire l’impact numérique', titleEn: 'Lower digital impact' },
  { catFr: 'Le Mag', catEn: 'The Mag', titleFr: 'Choisir son smartphone', titleEn: 'Pick your smartphone' },
]

const faqKeys = [
  ['faq1q', 'faq1a'],
  ['faq2q', 'faq2a'],
  ['faq3q', 'faq3a'],
  ['faq4q', 'faq4a'],
]

function MagAndFaq() {
  const { locale } = useLocaleStore()
  const [open, setOpen] = useState(0)

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t(locale, 'magTitle')}</h2>
        </div>
        <HorizontalSection gapClass="gap-5">
          {articles.map((a, i) => (
            <article
              key={i}
              className="snap-start shrink-0 w-[min(100%,280px)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm"
            >
              <div className="h-36 bg-gradient-to-br from-orange-200 to-amber-100" />
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{locale === 'en' ? a.catEn : a.catFr}</p>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                  {locale === 'en' ? a.titleEn : a.titleFr}
                </h3>
              </div>
            </article>
          ))}
        </HorizontalSection>
        <div className="flex justify-end mt-6">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium"
          >
            {t(locale, 'magMore')} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="bg-surface-muted border-t border-gray-200 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-10">
            {t(locale, 'faqTitle')}
          </h2>
          <ul className="space-y-2">
            {faqKeys.map(([qKey, aKey], idx) => (
              <li key={qKey} className="border-b border-gray-200 pb-2">
                <button
                  type="button"
                  className="w-full flex justify-between items-center text-left py-3 gap-4"
                  onClick={() => setOpen(open === idx ? -1 : idx)}
                  aria-expanded={open === idx}
                >
                  <span className="font-semibold text-gray-900 text-sm">{t(locale, qKey)}</span>
                  <span className="text-gray-500 shrink-0">{open === idx ? '−' : '+'}</span>
                </button>
                {open === idx && (
                  <p className="text-sm text-gray-600 pb-3 leading-relaxed">{t(locale, aKey)}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default MagAndFaq
