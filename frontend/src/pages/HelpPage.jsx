import SeoHead from '../components/SeoHead'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'

function HelpPage() {
  const locale = useLocaleStore((s) => s.locale)
  return (
    <div className="max-w-4xl mx-auto">
      <SeoHead
        title={`${t(locale, 'helpTitle')} - Marketplace`}
        description={locale === 'en' ? 'Help center: shopping, shipping, returns and support.' : "Centre d'aide: achats, livraison, retours et support."}
        canonicalPath="/help"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Comment acheter ?', acceptedAnswer: { '@type': 'Answer', text: 'Crée un compte, ajoute au panier, puis valide ta commande.' } },
          { '@type': 'Question', name: 'Comment fonctionne la livraison ?', acceptedAnswer: { '@type': 'Answer', text: 'Le suivi apparaît dans tes commandes après expédition.' } },
        ],
      }) }} />
      <h1 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'helpTitle')}</h1>
      <div className="card space-y-3 text-sm text-gray-700">
        <p><span className="font-medium">Comment acheter ?</span> Crée un compte, ajoute au panier, puis valide ta commande.</p>
        <p><span className="font-medium">Livraison :</span> Le suivi apparaît dans tes commandes après expédition.</p>
        <p><span className="font-medium">Retours :</span> Contacte le vendeur depuis ta commande en cas de problème.</p>
        <p><span className="font-medium">Support :</span> Écris-nous via la section compte.</p>
      </div>
    </div>
  )
}

export default HelpPage
