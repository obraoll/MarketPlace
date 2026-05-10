import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'
import { getApiErrorMessage } from '../utils/apiErrors'
import SeoHead from '../components/SeoHead'
import HeroCarousel from '../components/home/HeroCarousel'
import ValueProposition from '../components/home/ValueProposition'
import TrustBadges from '../components/home/TrustBadges'
import CategoryTilesGrid from '../components/home/CategoryTilesGrid'
import OffersSplitSection from '../components/home/OffersSplitSection'
import BestSellersRow from '../components/home/BestSellersRow'
import BrandStrip from '../components/home/BrandStrip'
import TestimonialsRow from '../components/home/TestimonialsRow'
import DualPromoBanners from '../components/home/DualPromoBanners'
import MagAndFaq from '../components/home/MagAndFaq'

function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(false)
      setErrorMessage('')
      try {
        const res = await productsAPI.getAll({ limit: 50 })
        if (!cancelled) setProducts(res.data || [])
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setError(true)
          setErrorMessage(getApiErrorMessage(err, 'Catalogue indisponible.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="pb-4">
      <SeoHead
        title="Marketplace - Produits reconditionnés"
        description="Achetez des produits reconditionnés testés et garantis par nos vendeurs partenaires."
        canonicalPath="/"
      />
      <HeroCarousel />
      <ValueProposition />
      <TrustBadges />
      <CategoryTilesGrid />
      <OffersSplitSection
        products={products}
        loading={loading}
        error={error}
        errorMessage={errorMessage}
      />
      <BestSellersRow
        products={products}
        loading={loading}
        error={error}
        errorMessage={errorMessage}
      />
      <BrandStrip />
      <TestimonialsRow />
      <DualPromoBanners />
      <MagAndFaq />
    </div>
  )
}

export default HomePage
