import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

const items = [
  { icon: '★', titleKey: 'trust1Title', descKey: 'trust1Desc' },
  { icon: '✓', titleKey: 'trust2Title', descKey: 'trust2Desc' },
  { icon: '↩', titleKey: 'trust3Title', descKey: 'trust3Desc' },
  { icon: '◎', titleKey: 'trust4Title', descKey: 'trust4Desc' },
]

function TrustBadges() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.titleKey}
            className="flex gap-4 items-start rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
          >
            <span className="text-2xl text-gray-900 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-muted shrink-0">
              {item.icon}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{t(locale, item.titleKey)}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t(locale, item.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TrustBadges
