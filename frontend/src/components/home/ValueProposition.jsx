import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

function ValueProposition() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
        {t(locale, 'valueTitle')}
      </h2>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-base">
        {t(locale, 'valueSub')}{' '}
        <Link to="/help" className="underline font-medium text-gray-900 hover:no-underline">
          {t(locale, 'valueLink')}
        </Link>
      </p>
    </section>
  )
}

export default ValueProposition
