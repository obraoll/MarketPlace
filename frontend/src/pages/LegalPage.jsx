import SeoHead from '../components/SeoHead'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'

function LegalPage() {
  const locale = useLocaleStore((s) => s.locale)
  return (
    <div className="max-w-4xl mx-auto">
      <SeoHead
        title={`${t(locale, 'legalTitle')} - Marketplace`}
        description={locale === 'en' ? 'Marketplace terms and conditions.' : "Conditions générales d'utilisation de la marketplace."}
        canonicalPath="/legal"
      />
      <h1 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'legalTitle')}</h1>
      <div className="card space-y-3 text-sm text-gray-700">
        <p>En utilisant cette marketplace, vous acceptez les conditions d'utilisation.</p>
        <p>Les vendeurs sont responsables de la conformité des produits vendus.</p>
        <p>Les retours et remboursements suivent les règles affichées sur la commande.</p>
        <p>Les données personnelles sont traitées conformément à la politique de confidentialité.</p>
      </div>
    </div>
  )
}

export default LegalPage
