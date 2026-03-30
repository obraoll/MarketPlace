import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useWishlistStore } from '../stores/wishlistStore'
import ProductCard from '../components/ProductCard'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const wishlistIds = useWishlistStore((s) => s.ids)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const [compareIds, setCompareIds] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'relevance',
  })

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  useEffect(() => {
    fetchAllProducts()
  }, [])

  useEffect(() => {
    const compareParam = searchParams.get('compare')
    if (!compareParam) return
    const ids = compareParam
      .split(',')
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 3)
    setCompareIds(ids)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    const loadRecent = async () => {
      try {
        const raw = localStorage.getItem('recently_viewed_ids') || '[]'
        const ids = JSON.parse(raw)
        if (!Array.isArray(ids) || ids.length === 0) {
          setRecentProducts([])
          return
        }
        const rows = await Promise.all(
          ids.slice(0, 4).map((id) => productsAPI.getById(id).then((r) => r.data).catch(() => null))
        )
        if (!cancelled) setRecentProducts(rows.filter(Boolean))
      } catch {
        if (!cancelled) setRecentProducts([])
      }
    }
    loadRecent()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.condition) params.condition = filters.condition
      if (filters.min_price) params.min_price = filters.min_price
      if (filters.max_price) params.max_price = filters.max_price
      const response = await productsAPI.getAll(params)
      const list = response.data || []
      if (filters.sort === 'price_asc') {
        list.sort((a, b) => Number(a.price) - Number(b.price))
      } else if (filters.sort === 'price_desc') {
        list.sort((a, b) => Number(b.price) - Number(a.price))
      }
      setProducts(list)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 })
      setAllProducts(response.data || [])
    } catch (error) {
      console.error('Erreur chargement suggestions:', error)
    }
  }

  const handleFilterChange = (e) => {
    const nextFilters = { ...filters, [e.target.name]: e.target.value }
    setFilters(nextFilters)
    if (e.target.name === 'search') {
      const q = e.target.value.trim().toLowerCase()
      if (!q) {
        setSearchSuggestions([])
        return
      }
      const suggestions = allProducts
        .filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q))
        .slice(0, 6)
      setSearchSuggestions(suggestions)
    }
  }

  const applyFilters = () => {
    const params = {}
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params[key] = filters[key]
    })
    setSearchParams(params)
    setSearchSuggestions([])
  }

  const resetFilters = () => {
    setFilters({ search: '', category: '', condition: '', min_price: '', max_price: '', sort: 'relevance' })
    setSearchParams({})
    setSearchSuggestions([])
  }

  const toggleCompare = (productId) => {
    setCompareIds((prev) => {
      let next
      if (prev.includes(productId)) next = prev.filter((id) => id !== productId)
      else if (prev.length >= 3) next = prev
      else next = [...prev, productId]
      const params = Object.fromEntries(searchParams.entries())
      if (next.length > 0) params.compare = next.join(',')
      else delete params.compare
      setSearchParams(params)
      return next
    })
  }

  const comparedProducts = products.filter((p) => compareIds.includes(p.id))

  return (
    <div className="max-w-6xl mx-auto">
      <SeoHead
        title="Produits - Marketplace"
        description="Catalogue de produits reconditionnés avec filtres, comparateur et favoris."
        canonicalPath="/products"
      />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Produits' }]} />
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Tous les produits</h1>
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-700">
          Favoris:{' '}
          <Link to="/wishlist" className="font-semibold text-gray-900 underline hover:no-underline">
            {wishlistIds.length} produit(s)
          </Link>
        </p>
        <p className="text-sm text-gray-700">
          Comparaison: <span className="font-semibold">{compareIds.length}/3</span>
        </p>
        {compareIds.length >= 2 && (
          <Link to={`/compare?ids=${compareIds.join(',')}`} className="text-sm text-gray-900 underline hover:no-underline">
            Ouvrir la page comparateur
          </Link>
        )}
      </div>

      {recentProducts.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Vus récemment</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentProducts.map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Filtres</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative">
            <input type="text" name="search" placeholder="Rechercher..." value={filters.search} onChange={handleFilterChange} className="input" />
            {searchSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-sm">
                {searchSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, search: s.name }))
                      setSearchSuggestions([])
                    }}
                  >
                    {s.name} - {s.brand}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select name="category" value={filters.category} onChange={handleFilterChange} className="input">
            <option value="">Toutes catégories</option>
            <option value="smartphone">Smartphone</option>
            <option value="ordinateur">Ordinateur</option>
            <option value="tablette">Tablette</option>
            <option value="montre">Montre</option>
            <option value="ecouteurs">Écouteurs</option>
            <option value="console">Console</option>
          </select>
          <select name="condition" value={filters.condition} onChange={handleFilterChange} className="input">
            <option value="">Tous états</option>
            <option value="excellent">Excellent</option>
            <option value="bon">Bon</option>
            <option value="correct">Correct</option>
          </select>
          <input type="number" name="min_price" placeholder="Prix min" value={filters.min_price} onChange={handleFilterChange} className="input" />
          <input type="number" name="max_price" placeholder="Prix max" value={filters.max_price} onChange={handleFilterChange} className="input" />
          <select name="sort" value={filters.sort} onChange={handleFilterChange} className="input">
            <option value="relevance">Pertinence</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={applyFilters} className="btn btn-primary">Appliquer</button>
          <button onClick={resetFilters} className="btn btn-secondary">Réinitialiser</button>
        </div>
      </div>

      {comparedProducts.length >= 2 && (
        <div className="card mb-6 overflow-x-auto">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Comparateur rapide</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Produit</th>
                {comparedProducts.map((p) => <th key={p.id} className="text-left py-2">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">Prix</td>
                {comparedProducts.map((p) => <td key={p.id} className="py-2">{Number(p.price).toFixed(2)} €</td>)}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">État</td>
                {comparedProducts.map((p) => <td key={p.id} className="py-2">{p.condition}</td>)}
              </tr>
              <tr>
                <td className="py-2 font-medium">Stock</td>
                {comparedProducts.map((p) => <td key={p.id} className="py-2">{p.stock}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {[...Array(6)].map((_, idx) => (
            <div key={`skeleton-${idx}`} className="card animate-pulse h-72">
              <div className="w-full h-40 bg-gray-100 rounded mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-600">Aucun produit trouvé</p>
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
              <div
                className="grid grid-cols-2 gap-2 shrink-0 mt-auto w-full min-w-0 pt-3 border-t border-gray-100"
                role="group"
                aria-label="Actions sur le produit"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleWishlist(product.id)
                  }}
                  className="btn btn-secondary inline-flex items-center justify-center min-h-[2.75rem] w-full min-w-0 text-xs px-2 py-2 leading-tight text-center"
                  title={wishlistIds.includes(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <span className="line-clamp-2 break-words">
                    {wishlistIds.includes(product.id) ? 'Favoris ✓' : 'Favoris'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleCompare(product.id)
                  }}
                  className="btn btn-secondary inline-flex items-center justify-center min-h-[2.75rem] w-full min-w-0 text-xs px-2 py-2 leading-tight text-center"
                  title={compareIds.includes(product.id) ? 'Retirer du comparateur' : 'Ajouter au comparateur'}
                >
                  <span className="line-clamp-2 break-words">
                    {compareIds.includes(product.id) ? 'Comparé ✓' : 'Comparer'}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
