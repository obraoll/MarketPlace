import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { ordersAPI, analyticsAPI } from '../services/api'
import { useState } from 'react'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function CartPage() {
  const navigate = useNavigate()
  const { items, fetchCart, updateQuantity, removeItem, getTotal } = useCartStore()
  const locale = useLocaleStore((s) => s.locale)
  const [shippingAddress, setShippingAddress] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      alert('Merci de renseigner une adresse de livraison.')
      return
    }
    try {
      await analyticsAPI.trackEvent({ event_type: 'checkout_started' })
      const response = await ordersAPI.createFromCart({
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        promo_code: promoCode || null,
      })
      analyticsAPI.trackEvent({ event_type: 'order_completed', order_id: response.data?.id }).catch(() => {})
      alert(`Commande créée avec succès. N° ${response.data?.order_number || ''}`)
      navigate('/orders')
    } catch (error) {
      alert(error?.response?.data?.detail || 'Erreur lors de la création de la commande.')
    }
  }

  const applyPromo = async () => {
    const code = promoCode.trim()
    if (!code) {
      setPromoDiscount(0)
      return
    }
    try {
      const res = await ordersAPI.validatePromo(code, getTotal())
      if (res.data?.valid) {
        setPromoDiscount(Number(res.data.discount_amount || 0))
      } else {
        setPromoDiscount(0)
        alert('Code promo invalide ou expiré.')
      }
    } catch {
      setPromoDiscount(0)
      alert('Impossible de valider ce code promo.')
    }
  }

  const shippingCost = (() => {
    const total = getTotal()
    if (shippingMethod === 'express') return 9.9
    if (shippingMethod === 'relay') return 4.9
    return total >= 80 ? 0 : 6.9
  })()

  const grandTotal = Math.max(0, getTotal() - promoDiscount) + shippingCost

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <SeoHead title={`${t(locale, 'myCart')} - Marketplace`} description="Panier d'achat et finalisation de commande." canonicalPath="/cart" />
        <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: t(locale, 'myCart') }]} />
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Mon panier</h1>
        <div className="card text-center py-10">
          <p className="text-sm text-gray-600 mb-4">{t(locale, 'yourCartEmpty')}</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            {t(locale, 'discoverProducts')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SeoHead title={`${t(locale, 'myCart')} - Marketplace`} description="Panier d'achat et finalisation de commande." canonicalPath="/cart" />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: t(locale, 'myCart') }]} />
      <h1 className="text-lg font-semibold text-gray-900 mb-6">{t(locale, 'myCart')}</h1>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="card flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">{item.product?.name}</h3>
              <p className="text-xs text-gray-500">{item.product?.brand}</p>
              <p className="text-sm font-medium text-gray-900">{Number(item.product?.price || 0).toFixed(2)} €</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="btn btn-secondary px-2 py-1 text-xs"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.product?.stock}
                className="btn btn-secondary px-2 py-1 text-xs"
              >
                +
              </button>
            </div>
            <button onClick={() => removeItem(item.id)} className="btn btn-danger text-xs">
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="card bg-gray-50 border-gray-200">
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse de livraison</label>
            <textarea
              className="input"
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Rue, code postal, ville, pays"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse de facturation (optionnel)</label>
            <textarea
              className="input"
              rows={2}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Si différente de l'adresse de livraison"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Livraison</label>
              <select className="input" value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="relay">Point relais</option>
                <option value="express">Express</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Paiement</label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="card">Carte bancaire</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Virement</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Code promo"
            />
            <button type="button" className="btn btn-secondary" onClick={applyPromo}>Appliquer</button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-700">Remise promo</span>
          <span className="text-sm font-medium text-gray-900">- {promoDiscount.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-700">Sous-total</span>
          <span className="text-sm font-medium text-gray-900">{getTotal().toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-700">Livraison</span>
          <span className="text-sm font-medium text-gray-900">{shippingCost.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center mb-4 border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-900">Total à payer</span>
          <span className="font-semibold text-gray-900">{grandTotal.toFixed(2)} €</span>
        </div>
        <button onClick={handleCheckout} className="btn btn-primary w-full py-2">
          Payer et commander
        </button>
      </div>
    </div>
  )
}

export default CartPage
