import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsAPI } from '../services/api'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function ComparePage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const ids = useMemo(() => {
    const raw = searchParams.get('ids') || ''
    return raw
      .split(',')
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 3)
  }, [searchParams])

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
        const rows = await Promise.all(ids.map((id) => productsAPI.getById(id).then((r) => r.data).catch(() => null)))
        if (!cancelled) setProducts(rows.filter(Boolean))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [ids])

  const shareUrl = `${window.location.origin}/compare?ids=${ids.join(',')}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SeoHead
        title="Comparateur - Marketplace"
        description="Comparez plusieurs produits reconditionnés côte à côte."
        canonicalPath={`/compare${ids.length ? `?ids=${ids.join(',')}` : ''}`}
      />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Comparateur' }]} />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Comparateur</h1>
        <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900 underline">Retour aux produits</Link>
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-sm text-gray-600">Chargement...</p>
      ) : products.length < 2 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-600 mb-3">Ajoute au moins 2 produits pour comparer.</p>
          <Link to="/products" className="btn btn-primary inline-block">Choisir des produits</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">Lien partageable: <span className="font-medium">{shareUrl}</span></p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Produit</th>
                {products.map((p) => <th key={p.id} className="text-left py-2">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">Prix</td>
                {products.map((p) => <td key={p.id} className="py-2">{Number(p.price).toFixed(2)} €</td>)}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 font-medium">État</td>
                {products.map((p) => <td key={p.id} className="py-2">{p.condition}</td>)}
              </tr>
              <tr>
                <td className="py-2 font-medium">Stock</td>
                {products.map((p) => <td key={p.id} className="py-2">{p.stock}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ComparePage
