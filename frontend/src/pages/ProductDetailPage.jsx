import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsAPI, analyticsAPI, reviewsAPI, questionsAPI } from '../services/api'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

const conditionLabels = {
  excellent: 'Excellent',
  bon: 'Bon',
  correct: 'Correct',
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [reviews, setReviews] = useState([])
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchProduct()
  }, [id])

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
        // ignore local storage errors
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
      alert('Produit ajouté au panier.')
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
      alert(e?.response?.data?.detail || 'Erreur envoi question')
    }
  }

  if (isLoading) return <p className="text-center py-10 text-sm text-gray-600">Chargement...</p>
  if (!product) return <p className="text-center py-10 text-sm text-gray-600">Produit non trouvé</p>

  return (
    <div className="max-w-6xl mx-auto">
      <SeoHead
        title={`${product.name} - Marketplace`}
        description={product.description || `${product.name} reconditionné`}
        canonicalPath={`/products/${product.id}`}
      />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Produits', to: '/products' }, { label: product.name }]} />
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6 text-sm">
        ← Retour
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded border border-gray-200 aspect-square flex items-center justify-center">
          {activeImage ? (
            <img src={activeImage} alt={product.name} loading="eager" decoding="async" className="w-full h-full object-cover rounded" />
          ) : (
            <span className="text-6xl">📱</span>
          )}
        </div>
        {Array.isArray(product.image_urls) && product.image_urls.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {product.image_urls.slice(0, 8).map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`border rounded overflow-hidden ${activeImage === img ? 'border-gray-900' : 'border-gray-200'}`}
              >
                <img src={img} alt={product.name} loading="lazy" decoding="async" className="w-full h-16 object-cover" />
              </button>
            ))}
          </div>
        )}

        <div>
          <span className="text-sm font-medium text-gray-600">{product.brand}</span>
          <h1 className="text-xl font-semibold text-gray-900 mt-1 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-semibold text-gray-900">{Number(product.price).toFixed(2)} €</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-medium">
              {conditionLabels[product.condition]}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-xs font-medium">
                {product.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
          {product.specifications && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Caractéristiques</h3>
              <p className="text-sm text-gray-600">{product.specifications}</p>
            </div>
          )}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Variantes</h3>
              <div className="space-y-1">
                {product.variants.map((v, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    {v.name || 'Option'}: {v.value || '-'} {v.extra_price ? `( +${Number(v.extra_price).toFixed(2)} € )` : ''}
                  </p>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            Stock : <span className="font-medium text-gray-900">{product.stock}</span>
          </p>

          {product.stock > 0 ? (
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input w-20"
              />
              <button onClick={handleAddToCart} className="btn btn-primary flex-1">
                Ajouter au panier
              </button>
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-100">
              Produit en rupture de stock
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Garantie et livraison</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>Garantie 12 mois</li>
              <li>Contrôle qualité 30 points</li>
              <li>Livraison offerte dès 50€</li>
              <li>Retour gratuit sous 14 jours</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Avis vérifiés</h3>
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 8).map((r) => (
                <div key={r.id} className="border border-gray-100 rounded p-3">
                  <p className="text-xs text-gray-700">Note: {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                  <p className="text-sm text-gray-700 mt-1">{r.comment || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Questions & réponses</h3>
          <div className="space-y-3 mb-3">
            {questions.length === 0 ? (
              <p className="text-xs text-gray-500">Aucune question.</p>
            ) : (
              questions.slice(0, 8).map((q) => (
                <div key={q.id} className="border border-gray-100 rounded p-3">
                  <p className="text-sm text-gray-800">Q: {q.question}</p>
                  <p className="text-xs text-gray-600 mt-1">R: {q.answer || 'Pas encore de réponse'}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="input"
              placeholder="Poser une question au vendeur"
            />
            <button type="button" className="btn btn-secondary" onClick={handleAskQuestion}>Envoyer</button>
          </div>
        </div>
      </div>
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
              price: Number(product.price || 0),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </div>
  )
}

export default ProductDetailPage
