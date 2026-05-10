import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useWishlistStore } from '../stores/wishlistStore'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids)
  const remove = useWishlistStore((s) => s.remove)
  const hydrate = useWishlistStore((s) => s.hydrate)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    hydrate()
    const onStorage = () => hydrate()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [hydrate])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (ids.length === 0) {
        setProducts([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const results = await Promise.all(
          ids.map((id) =>
            productsAPI.getById(id).then((r) => r.data).catch(() => null)
          )
        )
        if (!cancelled) {
          setProducts(results.filter(Boolean))
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [ids])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SeoHead
        title="Favoris - Marketplace"
        description="Retrouvez vos produits favoris enregistrés."
        canonicalPath="/wishlist"
      />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Favoris' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Mes favoris</h1>
        <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900 underline">
          Continuer les achats
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-sm text-gray-600">Chargement...</p>
      ) : ids.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-600 mb-4">Aucun produit en favoris pour le moment.</p>
          <Link to="/products" className="btn btn-primary inline-block">
            Parcourir les produits
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-600 mb-4">
            Les produits enregistrés ne sont plus disponibles ou ont été retirés.
          </p>
          <Link to="/products" className="btn btn-primary inline-block">
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col h-full min-h-0 min-w-0 w-full rounded-lg border border-transparent"
            >
              <div className="flex-1 min-h-0 min-w-0 flex flex-col mb-0">
                <ProductCard product={product} />
              </div>
              <div className="shrink-0 mt-auto w-full min-w-0 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="btn btn-secondary inline-flex items-center justify-center min-h-[2.75rem] w-full text-xs px-2 py-2 text-center"
                >
                  Retirer des favoris
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
