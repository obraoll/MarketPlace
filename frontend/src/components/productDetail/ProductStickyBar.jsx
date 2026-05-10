import { formatMoneyEUR } from './utils'

function ProductStickyBar({
  visible,
  locale,
  thumbUrl,
  productName,
  summaryLine,
  displayPrice,
  quantity,
  maxQty,
  onQuantityChange,
  onAddToCart,
  inStock,
  addToCartLabel,
  outOfStockLabel,
  inWishlist,
  onToggleWishlist,
  wishlistLabelAdd,
  wishlistLabelRemove,
}) {
  if (!visible) return null

  return (
    <div className="fixed left-0 right-0 z-30 top-28 sm:top-[7.5rem] border-b border-gray-200/90 bg-white/98 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 min-w-0 flex-1">
          {thumbUrl ? (
            <img src={thumbUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
            <p className="text-xs text-gray-500 truncate">{summaryLine}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto justify-end">
          <span className="text-base sm:text-xl font-bold text-gray-900 tabular-nums">
            {formatMoneyEUR(displayPrice, locale)}
          </span>
          <button
            type="button"
            onClick={onToggleWishlist}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-lg leading-none text-gray-700"
            aria-label={inWishlist ? wishlistLabelRemove : wishlistLabelAdd}
            title={inWishlist ? wishlistLabelRemove : wishlistLabelAdd}
          >
            {inWishlist ? '♥' : '♡'}
          </button>
          {inStock ? (
            <>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 1)}
                className="w-14 h-10 rounded-full border border-gray-200 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <button type="button" onClick={onAddToCart} className="btn-pdp-primary text-sm px-5 py-2.5 shrink-0">
                {addToCartLabel}
              </button>
            </>
          ) : (
            <span className="text-sm text-red-600 font-medium">{outOfStockLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductStickyBar
