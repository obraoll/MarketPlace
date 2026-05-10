import { Link } from 'react-router-dom'
import { useLocaleStore } from '../../stores/localeStore'
import { t } from '../../i18n'
import { averageRating } from './utils'
import PriceBlock from './PriceBlock'
import SellerLine from './SellerLine'

const conditionKey = {
  excellent: 'conditionExcellent',
  bon: 'conditionBon',
  correct: 'conditionCorrect',
}

function ProductPurchaseColumn({
  product,
  reviews,
  displayPrice,
  subtitle,
  badgeLabel,
  children,
  priceBlockRef,
}) {
  const { locale } = useLocaleStore()
  const condLabel = conditionKey[product.condition] ? t(locale, conditionKey[product.condition]) : product.condition
  const avg = averageRating(reviews)
  const rounded = avg != null ? Math.round(avg * 10) / 10 : null
  const starFilled = avg != null ? Math.min(5, Math.max(0, Math.round(avg))) : 0

  const pill = 'inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm'

  return (
    <div className="flex flex-col">
      <Link
        to="/products"
        className="mb-6 block rounded-2xl bg-gradient-to-r from-brand-lime/50 to-primary-100/60 px-4 py-3 text-center text-sm font-semibold text-gray-900 ring-1 ring-primary-200/60 transition hover:from-brand-lime/70 hover:to-primary-100"
      >
        {t(locale, 'pdpPromoLink')}
      </Link>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">{product.brand}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-4xl lg:text-[2.35rem]">
        {product.name}
      </h1>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-gray-600">{subtitle}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {rounded != null ? (
          <span className={`${pill} gap-1 border-amber-200/80 bg-amber-50/80`}>
            <span className="text-amber-500" aria-hidden>
              {'★'.repeat(starFilled)}
            </span>
            <span className="text-amber-200/90" aria-hidden>
              {'☆'.repeat(5 - starFilled)}
            </span>
            <span className="ml-0.5 font-bold text-gray-900">{rounded}</span>
            <span className="font-normal text-gray-500">
              ({reviews.length} {t(locale, 'pdpReviewsCount')})
            </span>
          </span>
        ) : (
          <span className={pill}>{t(locale, 'pdpNoRatingYet')}</span>
        )}
        <span className={pill}>{condLabel}</span>
        {product.badge ? (
          <span className={`${pill} border-gray-800 bg-gray-900 text-white`}>{product.badge}</span>
        ) : null}
        {badgeLabel ? <span className={`${pill} border-primary-200 bg-primary-50 text-primary-900`}>{badgeLabel}</span> : null}
      </div>

      <div className="my-8 border-t border-gray-100" />

      <div ref={priceBlockRef} className="space-y-6">
        <PriceBlock
          displayPrice={displayPrice}
          referencePriceNeuf={product.reference_price_neuf}
          locale={locale}
          saveLabel={t(locale, 'pdpSaveBadge')}
          newReferenceLabel={t(locale, 'pdpNewReferenceAria')}
          yourPriceLabel={t(locale, 'pdpYourPrice')}
          neufPriceLabel={t(locale, 'pdpNeufPriceLabel')}
        />
      </div>

      <div className="mt-8 space-y-4">
        <SellerLine
          seller={product.seller}
          template={t(locale, 'pdpSellerBy')}
          sectionLabel={t(locale, 'pdpSellerSection')}
        />
        {children}
      </div>
    </div>
  )
}

export default ProductPurchaseColumn
