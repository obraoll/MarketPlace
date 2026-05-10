import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

function SiteFooter() {
  const { locale } = useLocaleStore()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-2 gap-10 pb-12 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t(locale, 'footerNewsletterTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">{t(locale, 'footerNewsletterDesc')}</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3 sm:items-end" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t(locale, 'footerEmailPlaceholder')}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 shrink-0"
            >
              {t(locale, 'footerSubscribe')}
            </button>
          </form>
          <p className="md:col-span-2 text-xs text-gray-500">
            <button type="button" className="underline hover:no-underline">
              {t(locale, 'footerLearnMore')}
            </button>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-12 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t(locale, 'footerAbout')}</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerAboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerPress')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerImpact')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerCareers')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t(locale, 'footerHelpCol')}</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerContact')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'helpTitle')}
                </Link>
              </li>
              <li>
                <span className="cursor-default">{t(locale, 'footerDelivery')}</span>
              </li>
              <li>
                <span className="cursor-default">{t(locale, 'footerReturns')}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t(locale, 'footerServices')}</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/register" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerBecomeSeller')}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'compare')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t(locale, 'footerResources')}</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/help" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'navMag')}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerCompare')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t(locale, 'legal')}</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/legal" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerTerms')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerPrivacy')}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-gray-900 hover:underline">
                  {t(locale, 'footerLegal')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-500 leading-relaxed">
              {locale === 'en'
                ? 'Secure payments. Refurbished marketplace.'
                : 'Paiements sécurisés. Marketplace reconditionnée.'}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            © {year} {t(locale, 'footerCopyright')}
          </p>
          <div className="flex gap-3 text-gray-400">
            <span aria-hidden>●</span>
            <span aria-hidden>●</span>
            <span aria-hidden>●</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
