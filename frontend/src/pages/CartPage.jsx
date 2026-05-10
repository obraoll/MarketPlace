import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { ordersAPI, analyticsAPI } from '../services/api'
import { useState } from 'react'
import { useLocaleStore } from '../stores/localeStore'
import { useAuthStore } from '../stores/authStore'
import { t } from '../i18n'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'
import { getApiErrorMessage } from '../utils/apiErrors'

const SHIPPING_METHODS = {
  standard: {
    label: 'Standard',
    eta: '3 à 5 jours ouvrés',
    note: 'Offerte dès 80€',
  },
  relay: {
    label: 'Point relais',
    eta: '2 à 4 jours ouvrés',
    note: 'Retrait flexible près de chez vous',
  },
  express: {
    label: 'Express',
    eta: '24 à 48h',
    note: 'Traitement prioritaire',
  },
}

function CartPage() {
  const navigate = useNavigate()
  const { items, fetchCart, updateQuantity, removeItem, getTotal } = useCartStore()
  const locale = useLocaleStore((s) => s.locale)
  const user = useAuthStore((s) => s.user)
  const [shippingAddress, setShippingAddress] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleCheckout = async () => {
    setCheckoutError('')
    // Garde-fou UI miroir du backend: une commande est réservée au rôle client.
    if (user?.role === 'vendeur' || user?.role === 'admin') {
      const msg = 'Les comptes vendeur/admin ne peuvent pas passer commande. Connectez-vous avec un compte client.'
      setCheckoutError(msg)
      alert(msg)
      return
    }
    if (!shippingAddress.trim()) {
      alert('Merci de renseigner une adresse de livraison.')
      return
    }
    try {
      // Ne jamais bloquer la commande si l'analytics est bloqué (adblock / privacy extension).
      analyticsAPI.trackEvent({ event_type: 'checkout_started' }).catch(() => {})
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
      const msg = getApiErrorMessage(error, 'Erreur lors de la création de la commande.')
      setCheckoutError(msg)
      alert(msg)
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
  const selectedShipping = SHIPPING_METHODS[shippingMethod] || SHIPPING_METHODS.standard

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
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
    <div className="max-w-2xl mx-auto px-4 py-8">
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
        {(user?.role === 'vendeur' || user?.role === 'admin') && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
            Ce compte est <strong>{user?.role}</strong>. Pour créer une commande visible dans "Mes commandes", utilisez un compte client.
          </div>
        )}
        {checkoutError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {checkoutError}
          </div>
        ) : null}
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Livraison</label>
            <div className="grid sm:grid-cols-3 gap-2">
              {Object.entries(SHIPPING_METHODS).map(([key, info]) => {
                const active = shippingMethod === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setShippingMethod(key)}
                    className={`text-left rounded-lg border px-3 py-2 transition ${
                      active
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-900">{info.label}</p>
                    <p className="text-[11px] text-gray-600">{info.eta}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{info.note}</p>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            <p className="font-semibold">Livraison estimée ({selectedShipping.label})</p>
            <p>{selectedShipping.eta}</p>
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
        <button
          onClick={handleCheckout}
          disabled={user?.role === 'vendeur' || user?.role === 'admin'}
          className="btn btn-primary w-full py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Payer et commander
        </button>
      </div>
    </div>
  )
}

export default CartPage
