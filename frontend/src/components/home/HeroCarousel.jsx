import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const slides = [
  { key: '1', bg: 'bg-brand-lavender' },
  { key: '2', bg: 'bg-brand-lavenderDeep' },
  { key: '3', bg: 'bg-brand-lavender' },
]

function HeroCarousel() {
  const [i, setI] = useState(0)
  const { locale } = useLocaleStore()

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 7000)
    return () => clearInterval(id)
  }, [])

  const titleKeys = ['heroSlide1Title', 'heroSlide2Title', 'heroSlide3Title']
  const subKeys = ['heroSlide1Sub', 'heroSlide2Sub', 'heroSlide3Sub']
  const ctaKeys = ['heroSlide1Cta', 'heroSlide2Cta', 'heroSlide3Cta']

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
      <div
        className={`rounded-3xl overflow-hidden transition-colors duration-500 ${slides[i].bg}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-10 md:px-12 md:py-14">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2">
              {t(locale, titleKeys[i])}
            </p>
            <p className="text-lg md:text-xl text-gray-800 max-w-md mx-auto md:mx-0 mb-6">
              {t(locale, subKeys[i])}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {t(locale, ctaKeys[i])}
            </Link>
          </div>
          <div className="shrink-0 w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <span className="text-7xl md:text-8xl opacity-90" aria-hidden>
              🎧
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 pb-6 md:px-12">
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={slides[idx].key}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? 'w-8 bg-gray-900' : 'w-2 bg-gray-900/30 hover:bg-gray-900/50'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Précédent"
              onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
              className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Suivant"
              onClick={() => setI((v) => (v + 1) % slides.length)}
              className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
