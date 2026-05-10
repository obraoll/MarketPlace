import { useRef } from 'react'

/**
 * Carrousel horizontal avec scroll-snap et boutons prev/next.
 */
function HorizontalSection({ children, className = '', gapClass = 'gap-4' }) {
  const ref = useRef(null)

  const scrollByDir = (dir) => {
    const el = ref.current
    if (!el) return
    const amount = Math.min(el.clientWidth * 0.85, 400) * dir
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        className={`flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 sm:pr-24 ${gapClass}`}
      >
        {children}
      </div>
      <div className="absolute right-0 top-1 bottom-2 flex items-center gap-2 pointer-events-none">
        <button
          type="button"
          aria-label="Précédent"
          onClick={() => scrollByDir(-1)}
          className="pointer-events-auto w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Suivant"
          onClick={() => scrollByDir(1)}
          className="pointer-events-auto w-10 h-10 rounded-full bg-gray-900 text-white shadow-sm hover:bg-gray-800 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default HorizontalSection
