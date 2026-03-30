import { useState, useEffect } from 'react'
import { adminAPI, supportAPI } from '../services/api'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [vendors, setVendors] = useState([])
  const [promos, setPromos] = useState([])
  const [returns, setReturns] = useState([])
  const [messages, setMessages] = useState([])
  const [tickets, setTickets] = useState([])
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketSort, setTicketSort] = useState('newest')
  const [returnStatusFilter, setReturnStatusFilter] = useState('all')
  const [returnSearch, setReturnSearch] = useState('')
  const [returnSort, setReturnSort] = useState('newest')
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all')
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('all')
  const [promoForm, setPromoForm] = useState({ code: '', discount_percent: '', max_uses: '' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'stats') {
        const response = await adminAPI.getStats()
        setStats(response.data)
      } else if (activeTab === 'vendors') {
        const response = await adminAPI.getVendors()
        setVendors(response.data)
      } else if (activeTab === 'promos') {
        const response = await adminAPI.getPromos()
        setPromos(response.data)
      } else if (activeTab === 'litiges') {
        const [returnsRes, messagesRes, ticketsRes] = await Promise.all([
          adminAPI.getReturnRequests(),
          adminAPI.getSupportMessages(),
          supportAPI.getAdminTickets(),
        ])
        setReturns(returnsRes.data || [])
        setMessages(messagesRes.data || [])
        setTickets(ticketsRes.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVendorAction = async (vendorId, action) => {
    try {
      if (action === 'activate') {
        await adminAPI.activateVendor(vendorId)
      } else if (action === 'deactivate') {
        await adminAPI.deactivateVendor(vendorId)
      } else if (action === 'block') {
        await adminAPI.blockVendor(vendorId)
      }
      alert('Action effectuée avec succès')
      fetchData()
    } catch (error) {
      const msg = error.response?.data?.detail || "Erreur lors de l'action"
      alert(typeof msg === 'string' ? msg : msg[0]?.msg || 'Erreur')
    }
  }

  const handleCreatePromo = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createPromo({
        code: promoForm.code,
        discount_percent: Number(promoForm.discount_percent || 0),
        max_uses: Number(promoForm.max_uses || 0),
      })
      setPromoForm({ code: '', discount_percent: '', max_uses: '' })
      fetchData()
      alert('Code promo créé.')
    } catch (error) {
      alert(error.response?.data?.detail || 'Erreur création promo')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SeoHead title="Administration - Marketplace" description="Gestion vendeurs, promotions, retours et tickets support." canonicalPath="/admin/dashboard" />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Administration' }]} />
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded mb-6 text-center text-sm">
        Dashboard admin — Gestion des vendeurs. Pas d'accès à la marketplace (produits, panier, commandes).
      </div>
      <h1 className="text-lg font-semibold text-gray-900 mb-1">Gestion des vendeurs</h1>
      <p className="text-sm text-gray-600 mb-6">
        Vue d'ensemble et gestion des vendeurs. Les produits et la marketplace sont gérés par les vendeurs.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded border text-sm font-medium transition ${
            activeTab === 'stats'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded border text-sm font-medium transition ${
            activeTab === 'vendors'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          Gestion des vendeurs
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`px-4 py-2 rounded border text-sm font-medium transition ${
            activeTab === 'promos'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          Codes promo
        </button>
        <button
          onClick={() => setActiveTab('litiges')}
          className={`px-4 py-2 rounded border text-sm font-medium transition ${
            activeTab === 'litiges'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          Litiges
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-10 text-sm text-gray-600">Chargement...</p>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Vendeurs</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nombre</span>
                    <span className="font-semibold text-gray-900">{stats.users.vendeurs}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Indicateur vendeurs.</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Clients</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nombre</span>
                    <span className="font-semibold text-gray-900">{stats.users.clients}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Clients plateforme.</p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Activité</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Commandes</span>
                    <span className="font-semibold text-gray-900">{stats.orders.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chiffre d'affaires</span>
                    <span className="font-semibold text-gray-900">{Number(stats.orders.revenue).toFixed(2)} €</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Vue globale.</p>
              </div>
            </div>
          )}

          {/* Gestion des vendeurs */}
          {activeTab === 'vendors' && (
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Tous les vendeurs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500 text-sm">Aucun vendeur.</td>
                      </tr>
                    ) : (
                      vendors.map((v) => (
                        <tr key={v.id}>
                          <td className="px-4 py-3 text-gray-900">{v.first_name} {v.last_name}</td>
                          <td className="px-4 py-3 text-gray-600">{v.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${v.is_blocked ? 'bg-red-50 text-red-600' : v.is_active ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
                              {v.is_blocked ? 'Bloqué' : v.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {v.is_blocked ? (
                                <button onClick={() => handleVendorAction(v.id, 'activate')} className="text-sm text-gray-700 hover:underline">Débloquer</button>
                              ) : v.is_active ? (
                                <>
                                  <button onClick={() => handleVendorAction(v.id, 'deactivate')} className="text-sm text-gray-600 hover:underline">Désactiver</button>
                                  <button onClick={() => handleVendorAction(v.id, 'block')} className="text-sm text-red-600 hover:underline">Bloquer</button>
                                </>
                              ) : (
                                <button onClick={() => handleVendorAction(v.id, 'activate')} className="text-sm text-gray-700 hover:underline">Activer</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'promos' && (
            <div className="space-y-4">
              <div className="card">
                <h2 className="text-sm font-medium text-gray-900 mb-3">Créer un code promo</h2>
                <form onSubmit={handleCreatePromo} className="grid md:grid-cols-4 gap-2">
                  <input className="input" placeholder="Code" value={promoForm.code} onChange={(e) => setPromoForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required />
                  <input className="input" type="number" min="0" max="80" placeholder="% remise" value={promoForm.discount_percent} onChange={(e) => setPromoForm((p) => ({ ...p, discount_percent: e.target.value }))} required />
                  <input className="input" type="number" min="0" placeholder="Utilisations max (0 = illimité)" value={promoForm.max_uses} onChange={(e) => setPromoForm((p) => ({ ...p, max_uses: e.target.value }))} />
                  <button className="btn btn-primary" type="submit">Créer</button>
                </form>
              </div>
              <div className="card">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Liste des codes promo</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left">Code</th>
                        <th className="px-4 py-2 text-left">Remise</th>
                        <th className="px-4 py-2 text-left">Usages</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {promos.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 font-medium">{p.code}</td>
                          <td className="px-4 py-2">{Number(p.discount_percent).toFixed(1)} %</td>
                          <td className="px-4 py-2">{p.used_count} / {p.max_uses || '∞'}</td>
                          <td className="px-4 py-2">{p.is_active ? 'Actif' : 'Inactif'}</td>
                          <td className="px-4 py-2">
                            <button className="text-sm text-gray-700 hover:underline" onClick={async () => { await adminAPI.togglePromo(p.id); fetchData() }}>
                              {p.is_active ? 'Désactiver' : 'Activer'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'litiges' && (
            <div className="space-y-4">
              <div className="card">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-medium text-gray-900">Demandes de retour</h2>
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="Rechercher retour..."
                      value={returnSearch}
                      onChange={(e) => setReturnSearch(e.target.value)}
                    />
                    <select className="input" value={returnSort} onChange={(e) => setReturnSort(e.target.value)}>
                      <option value="newest">Plus récents</option>
                      <option value="oldest">Plus anciens</option>
                    </select>
                    <select className="input" value={returnStatusFilter} onChange={(e) => setReturnStatusFilter(e.target.value)}>
                      <option value="all">Tous statuts</option>
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="refunded">refunded</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left">Commande</th>
                        <th className="px-4 py-2 text-left">Client</th>
                        <th className="px-4 py-2 text-left">Motif</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...returns]
                        .filter((r) => returnStatusFilter === 'all' || r.status === returnStatusFilter)
                        .filter((r) => {
                          const q = returnSearch.trim().toLowerCase()
                          if (!q) return true
                          return `${r.order_id} ${r.customer_id} ${r.reason} ${r.status}`.toLowerCase().includes(q)
                        })
                        .sort((a, b) => (
                          returnSort === 'oldest'
                            ? new Date(a.created_at) - new Date(b.created_at)
                            : new Date(b.created_at) - new Date(a.created_at)
                        ))
                        .map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-2">#{r.order_id}</td>
                          <td className="px-4 py-2">#{r.customer_id}</td>
                          <td className="px-4 py-2">{r.reason}</td>
                          <td className="px-4 py-2">
                            <select
                              className="input"
                              value={r.status}
                              onChange={async (e) => {
                                await adminAPI.updateReturnStatus(r.id, e.target.value)
                                fetchData()
                              }}
                            >
                              <option value="pending">pending</option>
                              <option value="approved">approved</option>
                              <option value="rejected">rejected</option>
                              <option value="refunded">refunded</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Messages support</h2>
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className="border border-gray-100 rounded p-3">
                      <p className="text-xs text-gray-500">Commande #{m.order_id} - de #{m.sender_id} vers #{m.recipient_id}</p>
                      <p className="text-sm font-medium text-gray-900">{m.subject}</p>
                      <p className="text-sm text-gray-700">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-medium text-gray-900">Tickets support</h2>
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="Rechercher ticket..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                    />
                    <select className="input" value={ticketSort} onChange={(e) => setTicketSort(e.target.value)}>
                      <option value="newest">Plus récents</option>
                      <option value="oldest">Plus anciens</option>
                      <option value="priority">Priorité</option>
                    </select>
                    <select className="input" value={ticketStatusFilter} onChange={(e) => setTicketStatusFilter(e.target.value)}>
                      <option value="all">Tous statuts</option>
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="resolved">resolved</option>
                      <option value="closed">closed</option>
                    </select>
                    <select className="input" value={ticketPriorityFilter} onChange={(e) => setTicketPriorityFilter(e.target.value)}>
                      <option value="all">Toutes priorités</option>
                      <option value="low">low</option>
                      <option value="normal">normal</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...tickets]
                    .filter((t) => ticketStatusFilter === 'all' || t.status === ticketStatusFilter)
                    .filter((t) => ticketPriorityFilter === 'all' || t.priority === ticketPriorityFilter)
                    .filter((t) => {
                      const q = ticketSearch.trim().toLowerCase()
                      if (!q) return true
                      return `${t.subject} ${t.message} ${t.channel} ${t.category}`.toLowerCase().includes(q)
                    })
                    .sort((a, b) => {
                      if (ticketSort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
                      if (ticketSort === 'priority') {
                        const score = { high: 3, normal: 2, low: 1 }
                        return (score[b.priority] || 0) - (score[a.priority] || 0)
                      }
                      return new Date(b.created_at) - new Date(a.created_at)
                    })
                    .map((t) => (
                    <div key={t.id} className="border border-gray-100 rounded p-3">
                      <p className="text-sm font-medium text-gray-900">#{t.id} - {t.subject}</p>
                      <p className="text-xs text-gray-600 mb-2">Canal: {t.channel} | Priorité: {t.priority}</p>
                      <div className="flex gap-2">
                        <select
                          className="input"
                          value={t.status}
                          onChange={async (e) => {
                            await supportAPI.updateTicket(t.id, { status: e.target.value, priority: t.priority })
                            fetchData()
                          }}
                        >
                          <option value="open">open</option>
                          <option value="in_progress">in_progress</option>
                          <option value="resolved">resolved</option>
                          <option value="closed">closed</option>
                        </select>
                        <select
                          className="input"
                          value={t.priority}
                          onChange={async (e) => {
                            await supportAPI.updateTicket(t.id, { status: t.status, priority: e.target.value })
                            fetchData()
                          }}
                        >
                          <option value="low">low</option>
                          <option value="normal">normal</option>
                          <option value="high">high</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDashboard
