import { useState, useEffect } from 'react'
import { ordersAPI, reviewsAPI, supportAPI } from '../services/api'
import { useLocaleStore } from '../stores/localeStore'
import { t } from '../i18n'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-gray-100 text-gray-700',
  shipped: 'bg-gray-100 text-gray-700',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-red-600',
}

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

function OrdersPage() {
  const locale = useLocaleStore((s) => s.locale)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [returnReason, setReturnReason] = useState({})
  const [messageBody, setMessageBody] = useState({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await ordersAPI.getAll()
      setOrders(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturn = async (orderId) => {
    const reason = (returnReason[orderId] || '').trim()
    if (!reason) {
      alert('Merci d’indiquer un motif de retour.')
      return
    }
    try {
      await supportAPI.createReturn({ order_id: orderId, reason })
      alert('Demande de retour envoyée.')
      setReturnReason((prev) => ({ ...prev, [orderId]: '' }))
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erreur retour')
    }
  }

  const handleContact = async (orderId) => {
    const body = (messageBody[orderId] || '').trim()
    if (!body) {
      alert('Ajoute un message avant envoi.')
      return
    }
    try {
      await supportAPI.sendMessage({
        order_id: orderId,
        subject: `Commande ${orderId}`,
        message: body,
      })
      alert('Message envoyé.')
      setMessageBody((prev) => ({ ...prev, [orderId]: '' }))
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erreur message')
    }
  }

  const handleReview = async (orderId, productId) => {
    const noteRaw = prompt('Donne une note de 1 à 5')
    const rating = Number(noteRaw)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return
    const comment = prompt('Commentaire (optionnel)') || ''
    try {
      await reviewsAPI.create({
        order_id: orderId,
        product_id: productId,
        rating,
        comment,
      })
      alert('Avis envoyé.')
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erreur avis')
    }
  }

  if (isLoading) {
    return <p className="text-center py-10 text-sm text-gray-600">{t(locale, 'loading')}</p>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <SeoHead title={`${t(locale, 'myOrders')} - Marketplace`} description="Historique et suivi de vos commandes." canonicalPath="/orders" />
        <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: t(locale, 'myOrders') }]} />
        <h1 className="text-lg font-semibold text-gray-900 mb-6">{t(locale, 'myOrders')}</h1>
        <div className="card text-center py-10">
          <p className="text-sm text-gray-600">{t(locale, 'noOrdersYet')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SeoHead title={`${t(locale, 'myOrders')} - Marketplace`} description="Historique et suivi de vos commandes." canonicalPath="/orders" />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: t(locale, 'myOrders') }]} />
      <h1 className="text-lg font-semibold text-gray-900 mb-6">{t(locale, 'myOrders')}</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Commande #{order.order_number}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500">Tracking: TRK-{order.id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Timeline commande</p>
                <div className="flex flex-wrap gap-2">
                  {statusSteps.map((step) => {
                    const isDone = statusSteps.indexOf(order.status) >= statusSteps.indexOf(step)
                    return (
                      <span
                        key={step}
                        className={`px-2 py-0.5 rounded text-xs ${isDone ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {statusLabels[step]}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600">
                    <span>{item.product?.name || `Produit #${item.product_id}`} × {item.quantity}</span>
                    <span className="font-medium text-gray-900">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">{Number(order.total_amount).toFixed(2)} €</span>
              </div>
              <div className="mt-2 text-xs text-gray-600 grid md:grid-cols-2 gap-1">
                <p>Sous-total: {Number(order.subtotal_amount || 0).toFixed(2)} €</p>
                <p>Remise: -{Number(order.discount_amount || 0).toFixed(2)} €</p>
                <p>Livraison: {Number(order.shipping_amount || 0).toFixed(2)} €</p>
                <p>Code promo: {order.promo_code || 'Aucun'}</p>
              </div>
              {order.checkout_meta && (
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p>
                    Livraison ({order.checkout_meta.shipping_method}) : {Number(order.checkout_meta.shipping_cost || 0).toFixed(2)} €
                  </p>
                  <p>Paiement : {order.checkout_meta.payment_method} ({order.checkout_meta.payment_status})</p>
                  <p>Adresse livraison : {order.checkout_meta.shipping_address}</p>
                  <p>Adresse facturation : {order.checkout_meta.billing_address}</p>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button className="btn btn-secondary text-xs" onClick={() => handleReturn(order.id)}>Demande de retour</button>
                <button className="btn btn-secondary text-xs" onClick={() => handleContact(order.id)}>Contacter le vendeur</button>
              </div>
              <div className="mt-2 grid md:grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Motif de retour"
                  value={returnReason[order.id] || ''}
                  onChange={(e) => setReturnReason((prev) => ({ ...prev, [order.id]: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Message support"
                  value={messageBody[order.id] || ''}
                  onChange={(e) => setMessageBody((prev) => ({ ...prev, [order.id]: e.target.value }))}
                />
              </div>
              {order.status === 'delivered' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <button
                      key={`review-${item.id}`}
                      className="btn btn-secondary text-xs"
                      onClick={() => handleReview(order.id, item.product_id)}
                    >
                      Noter: {item.product?.name || `Produit #${item.product_id}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrdersPage
