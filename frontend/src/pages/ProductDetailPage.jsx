import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsAPI, analyticsAPI, reviewsAPI, questionsAPI } from '../services/api'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductGallery from '../components/productDetail/ProductGallery'
import ProductPurchaseColumn from '../components/productDetail/ProductPurchaseColumn'
import ConfiguratorFromVariants from '../components/productDetail/ConfiguratorFromVariants'
import ProductAccordions from '../components/productDetail/ProductAccordions'
import ProductStickyBar from '../components/productDetail/ProductStickyBar'
import RelatedProductsRow from '../components/productDetail/RelatedProductsRow'
import TrustBlocks from '../components/productDetail/TrustBlocks'
import { deriveSubtitle, clampStarRating } from '../components/productDetail/utils'

const conditionKey = {
  excellent: 'conditionExcellent',
  bon: 'conditionBon',
  correct: 'conditionCorrect',
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale } = useLocaleStore()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [reviews, setReviews] = useState([])
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [displayPrice, setDisplayPrice] = useState(0)
  const [summaryLine, setSummaryLine] = useState('')
  const [stickyVisible, setStickyVisible] = useState(false)
  const priceAnchorRef = useRef(null)
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => s.has(Number(id)))

  const conditionLabel = useMemo(() => {
    if (!product?.condition) return ''
    return conditionKey[product.condition] ? t(locale, conditionKey[product.condition]) : product.condition
  }, [product?.condition, locale])

  const onConfiguratorChange = useCallback(({ displayPrice: dp, summaryLine: line }) => {
    setDisplayPrice(dp)
    setSummaryLine(line)
  }, [])

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (!product) return
    setDisplayPrice(Number(product.price))
    setSummaryLine('')
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    const vs = product.variants
    if (!Array.isArray(vs) || vs.length === 0) {
      setSummaryLine(conditionLabel)
    }
  }, [product?.id, product?.variants, conditionLabel])

  useEffect(() => {
    const el = priceAnchorRef.current
    if (!el || !product) return
    const obs = new IntersectionObserver(
      ([e]) => setStickyVisible(!e.isIntersecting),
      { threshold: 0, rootMargin: '-96px 0px 0px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [product?.id])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const response = await productsAPI.getById(id)
      setProduct(response.data)
      const images = Array.isArray(response.data?.image_urls) ? response.data.image_urls : []
      setActiveImage(images[0] || response.data?.image_url || '')
      try {
        const currentId = Number(id)
        const raw = localStorage.getItem('recently_viewed_ids') || '[]'
        const parsed = JSON.parse(raw)
        const ids = Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : []
        const next = [currentId, ...ids.filter((n) => n !== currentId)].slice(0, 12)
        localStorage.setItem('recently_viewed_ids', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      analyticsAPI.trackEvent({ event_type: 'product_viewed', product_id: Number(id) }).catch(() => {})
      const [reviewsRes, questionsRes] = await Promise.all([
        reviewsAPI.getByProduct(id).catch(() => ({ data: [] })),
        questionsAPI.getByProduct(id).catch(() => ({ data: [] })),
      ])
      setReviews(reviewsRes.data || [])
      setQuestions(questionsRes.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const success = await addToCart(product.id, quantity)
    if (success) {
      analyticsAPI.trackEvent({ event_type: 'add_to_cart', product_id: product.id }).catch(() => {})
      alert(t(locale, 'pdpAddedToCart'))
    }
  }

  const handleAskQuestion = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const text = newQuestion.trim()
    if (!text) return
    try {
      await questionsAPI.ask({ product_id: Number(id), question: text })
      setNewQuestion('')
      const res = await questionsAPI.getByProduct(id)
      setQuestions(res.data || [])
    } catch (e) {
      alert(e?.response?.data?.detail || t(locale, 'pdpQuestionError'))
    }
  }

  const subtitle = product ? deriveSubtitle(product.specifications) : ''

  if (isLoading) {
    return <p className="text-center py-10 text-sm text-gray-600">{t(locale, 'loading')}</p>
  }
  if (!product) {
    return <p className="text-center py-10 text-sm text-gray-600">{t(locale, 'pdpNotFound')}</p>
  }

  const thumb = activeImage || product.image_url || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      <SeoHead
        title={`${product.name} - Marketplace`}
        description={product.description || `${product.name} reconditionné`}
        canonicalPath={`/products/${product.id}`}
      />
      <Breadcrumbs
        items={[
          { label: t(locale, 'pdpBreadcrumbHome'), to: '/' },
          { label: t(locale, 'products'), to: '/products' },
          { label: product.name },
        ]}
      />
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        ← {t(locale, 'pdpBack')}
      </button>

      <div className="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-[0_12px_48px_rgba(15,23,42,0.06)] md:p-8 lg:p-10">
        <div className="grid items-start gap-10 md:grid-cols-2 lg:gap-14">
        <ProductGallery
          productName={product.name}
          imageUrls={product.image_urls}
          imageUrl={product.image_url}
          activeImage={activeImage}
          onSelectImage={setActiveImage}
          refurbishedLabel={t(locale, 'pdpRefurbBadge')}
        />
        <div>
          <ProductPurchaseColumn
            product={product}
            reviews={reviews}
            displayPrice={displayPrice}
            subtitle={subtitle}
            badgeLabel={null}
            priceBlockRef={priceAnchorRef}
          >
            <ConfiguratorFromVariants
              variants={product.variants}
              basePrice={Number(product.price)}
              conditionLabel={conditionLabel}
              onChange={onConfiguratorChange}
              pickOptionLabel={t(locale, 'pdpPickOption')}
              groupFallbackLabel={t(locale, 'pdpGroupOther')}
              locale={locale}
            />
          </ProductPurchaseColumn>

          <p className="text-sm text-gray-600 mb-4">
            {t(locale, 'pdpStockLabel')}{' '}
            <span className="font-medium text-gray-900">{product.stock}</span>
          </p>

          {product.stock > 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t(locale, 'pdpQtyLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="h-11 w-16 rounded-full border border-gray-200 bg-white text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <button type="button" onClick={handleAddToCart} className="btn-pdp-primary flex-1 sm:min-w-[200px]">
                  {t(locale, 'pdpAddToCart')}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="btn-pdp-secondary shrink-0"
                  aria-label={inWishlist ? t(locale, 'pdpWishlistRemove') : t(locale, 'pdpWishlistAdd')}
                  title={inWishlist ? t(locale, 'pdpWishlistRemove') : t(locale, 'pdpWishlistAdd')}
                >
                  {inWishlist ? '♥' : '♡'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
              {t(locale, 'pdpOutOfStock')}
            </div>
          )}

          <TrustBlocks
            deliveryTitle={t(locale, 'pdpTrustDeliveryTitle')}
            deliveryText={t(locale, 'pdpTrustDeliveryText')}
            returnTitle={t(locale, 'pdpTrustReturnTitle')}
            returnText={t(locale, 'pdpTrustReturnText')}
            warrantyTitle={t(locale, 'pdpTrustWarrantyTitle')}
            warrantyText={t(locale, 'pdpTrustWarrantyText')}
          />
        </div>
        </div>
      </div>

      <ProductAccordions
        specifications={product.specifications}
        description={product.description}
        specsTitle={t(locale, 'pdpAccordionSpecs')}
        warrantyTitle={t(locale, 'pdpAccordionWarranty')}
        warrantyBody={t(locale, 'pdpAccordionWarrantyBody')}
        faqTitle={t(locale, 'pdpAccordionFaq')}
        faqBody={t(locale, 'pdpAccordionFaqBody')}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">{t(locale, 'pdpReviewsTitle')}</h3>
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500">{t(locale, 'pdpNoReviews')}</p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 8).map((r) => {
                const rv = clampStarRating(r.rating)
                return (
                <div key={r.id} className="border border-gray-100 rounded p-3">
                  <p className="text-xs text-gray-700">
                    {t(locale, 'pdpRatingLabel')}: {'★'.repeat(rv)}
                    {'☆'.repeat(5 - rv)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{r.comment || '—'}</p>
                </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">{t(locale, 'pdpQuestionsTitle')}</h3>
          <div className="space-y-3 mb-3">
            {questions.length === 0 ? (
              <p className="text-xs text-gray-500">{t(locale, 'pdpNoQuestions')}</p>
            ) : (
              questions.slice(0, 8).map((q) => (
                <div key={q.id} className="border border-gray-100 rounded p-3">
                  <p className="text-sm text-gray-800">
                    Q: {q.question}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    R: {q.answer || t(locale, 'pdpNoAnswerYet')}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="input"
              placeholder={t(locale, 'pdpAskPlaceholder')}
            />
            <button type="button" className="btn-pdp-secondary shrink-0" onClick={handleAskQuestion}>
              {t(locale, 'pdpSend')}
            </button>
          </div>
        </div>
      </div>

      <RelatedProductsRow productId={product.id} category={product.category} />

      <ProductStickyBar
        visible={stickyVisible}
        locale={locale}
        thumbUrl={thumb}
        productName={product.name}
        summaryLine={summaryLine || conditionLabel}
        displayPrice={displayPrice}
        quantity={quantity}
        maxQty={product.stock}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        inStock={product.stock > 0}
        addToCartLabel={t(locale, 'pdpAddToCart')}
        outOfStockLabel={t(locale, 'pdpOutOfStock')}
        inWishlist={inWishlist}
        onToggleWishlist={() => toggleWishlist(product.id)}
        wishlistLabelAdd={t(locale, 'pdpWishlistAdd')}
        wishlistLabelRemove={t(locale, 'pdpWishlistRemove')}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            brand: product.brand,
            description: product.description,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: Number(displayPrice || 0),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </div>
  )
}

export default ProductDetailPage
