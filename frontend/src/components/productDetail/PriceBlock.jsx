import { formatMoneyEUR } from './utils'

function PriceBlock({
  displayPrice,
  referencePriceNeuf,
  locale,
  saveLabel,
  newReferenceLabel,
  yourPriceLabel,
  neufPriceLabel,
}) {
  const ref = referencePriceNeuf != null ? Number(referencePriceNeuf) : null
  const showStrike = ref != null && ref > 0 && ref > displayPrice
  const saveAmount = showStrike ? ref - displayPrice : 0

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">{yourPriceLabel}</p>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight tabular-nums leading-none">
          {formatMoneyEUR(displayPrice, locale)}
        </span>
        {showStrike ? (
          <div className="flex flex-col items-start pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
              {neufPriceLabel}
            </span>
            <span className="text-lg sm:text-xl text-gray-400 line-through tabular-nums" aria-label={newReferenceLabel}>
              {formatMoneyEUR(ref, locale)}
            </span>
          </div>
        ) : null}
      </div>
      {saveAmount > 0 ? (
        <span className="inline-flex items-center rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
          {saveLabel.replace('{amount}', formatMoneyEUR(saveAmount, locale))}
        </span>
      ) : null}
    </div>
  )
}

export default PriceBlock
