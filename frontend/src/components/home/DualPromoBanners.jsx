import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'

function DualPromoBanners() {
  const { locale } = useLocaleStore()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="rounded-3xl bg-brand-limeSoft px-8 py-12 text-center border border-gray-900/5">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-900 max-w-xl mx-auto">
          {t(locale, 'promoNewsletterTitle')}
        </h2>
        <p className="mt-3 text-sm text-gray-700 max-w-md mx-auto">{t(locale, 'promoNewsletterSub')}</p>
        <form
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={t(locale, 'footerEmailPlaceholder')}
            className="flex-1 rounded-xl border border-gray-900/20 bg-white px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800"
          >
            {t(locale, 'footerSubscribe')}
          </button>
        </form>
        <button type="button" className="mt-4 text-xs text-gray-600 underline">
          {t(locale, 'footerLearnMore')}
        </button>
      </div>

      <div className="rounded-3xl bg-brand-lavenderDeep/90 px-8 py-10 md:py-12 flex flex-col md:flex-row gap-10 items-stretch">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-900">
            {t(locale, 'promoResaleTitle')}
          </h2>
          <p className="mt-3 text-sm text-gray-800">{t(locale, 'promoResaleSub')}</p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 w-full md:w-auto md:self-start"
          >
            {t(locale, 'promoResaleCta')}
          </Link>
        </div>
        <div className="flex-1 rounded-2xl bg-white/90 p-6 space-y-4 text-sm text-gray-800">
          <div className="flex gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-lavender flex items-center justify-center shrink-0">
              🏅
            </span>
            <span>{locale === 'en' ? 'Best offers from verified sellers.' : 'Meilleures offres auprès de vendeurs vérifiés.'}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-lavender flex items-center justify-center shrink-0">
              💶
            </span>
            <span>{locale === 'en' ? 'Fast payment once accepted.' : 'Paiement rapide une fois l’offre acceptée.'}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-10 h-10 rounded-lg bg-brand-lavender flex items-center justify-center shrink-0">
              🚚
            </span>
            <span>{locale === 'en' ? 'Simple shipping options.' : 'Options d’envoi simplifiées.'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DualPromoBanners
