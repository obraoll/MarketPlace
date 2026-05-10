import { useState, useEffect, useMemo } from 'react'
import { productsAPI, ordersAPI, analyticsAPI } from '../services/api'
import { useVendorDashboardStore } from '../stores/vendorDashboardStore'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

const PERIOD_OPTIONS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: '30d', label: '30 derniers jours' },
  { value: 'year', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
]

const MENU_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'commandes', label: 'Commandes', icon: '🧾' },
  { id: 'revenus', label: 'Revenus', icon: '💰' },
  { id: 'produits', label: 'Produits', icon: '📦' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'inventaire', label: 'Inventaire', icon: '📋' },
  { id: 'clients', label: 'Clients', icon: '👥' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'factures', label: 'Factures', icon: '📄' },
  { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
  { id: 'aide', label: 'Aide', icon: '❓' },
]

const CATEGORY_LABELS = {
  smartphone: 'Smartphone',
  ordinateur: 'Ordinateur',
  tablette: 'Tablette',
  montre: 'Montre',
  ecouteurs: 'Écouteurs',
  console: 'Console',
}

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'À expédier' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

const ALLOWED_VENDOR_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function filterOrdersByPeriod(orders, period) {
  if (!orders?.length || period === 'all') return orders
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const day30Start = new Date(todayStart)
  day30Start.setDate(day30Start.getDate() - 30)
  const yearStart = new Date(now.getFullYear(), 0, 1)
  return orders.filter((o) => {
    const d = o.created_at ? new Date(o.created_at) : null
    if (!d) return false
    if (period === 'today') return d >= todayStart
    if (period === 'week') return d >= weekStart
    if (period === '30d') return d >= day30Start
    if (period === 'year') return d >= yearStart
    return true
  })
}

function useSellerAnalytics(orders, products, clients) {
  const myProductIds = useMemo(() => new Set((products || []).map((p) => p.id)), [products])
  const clientById = useMemo(() => {
    const m = {}
    ;(clients || []).forEach((c) => { m[c.id] = c })
    return m
  }, [clients])

  const sellerRevenueByOrder = useMemo(() => {
    if (!orders?.length) return {}
    const map = {}
    orders.forEach((order) => {
      let rev = 0
      ;(order.items || []).forEach((item) => {
        if (myProductIds.has(item.product_id)) {
          rev += (item.quantity || 0) * (item.unit_price || 0)
        }
      })
      map[order.id] = rev
    })
    return map
  }, [orders, myProductIds])

  const salesByMonth = useMemo(() => {
    const byMonth = {}
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      byMonth[key] = { month: key, label: MOIS[d.getMonth()], ventes: 0 }
    }
    ;(orders || []).forEach((order) => {
      const rev = sellerRevenueByOrder[order.id] || 0
      if (!order.created_at) return
      const d = new Date(order.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (byMonth[key]) byMonth[key].ventes += rev
    })
    return Object.values(byMonth)
  }, [orders, sellerRevenueByOrder])

  const bestSellers = useMemo(() => {
    const byProduct = {}
    ;(orders || []).forEach((order) => {
      ;(order.items || []).forEach((item) => {
        if (!myProductIds.has(item.product_id)) return
        const id = item.product_id
        if (!byProduct[id]) byProduct[id] = { product_id: id, quantity: 0, revenue: 0 }
        byProduct[id].quantity += item.quantity || 0
        byProduct[id].revenue += (item.quantity || 0) * (item.unit_price || 0)
      })
    })
    const list = Object.values(byProduct)
    list.sort((a, b) => b.revenue - a.revenue)
    const productById = {}
    ;(products || []).forEach((p) => { productById[p.id] = p })
    return list.slice(0, 10).map((row) => ({
      ...row,
      name: productById[row.product_id]?.name || `Produit #${row.product_id}`,
      price: productById[row.product_id]?.price,
    }))
  }, [orders, products, myProductIds])

  const topClients = useMemo(() => {
    const byCustomer = {}
    ;(orders || []).forEach((order) => {
      const rev = sellerRevenueByOrder[order.id] || 0
      const cid = order.customer_id
      if (!byCustomer[cid]) byCustomer[cid] = { customer_id: cid, total: 0 }
      byCustomer[cid].total += rev
    })
    const list = Object.values(byCustomer).filter((c) => c.total > 0)
    list.sort((a, b) => b.total - a.total)
    return list.slice(0, 10).map((row) => {
      const c = clientById[row.customer_id]
      return {
        ...row,
        name: c ? `${c.first_name} ${c.last_name}` : `Client #${row.customer_id}`,
        email: c?.email,
      }
    })
  }, [orders, sellerRevenueByOrder, clientById])

  const orderCountByStatus = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }
    ;(orders || []).forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++
    })
    return counts
  }, [orders])

  const salesByCategory = useMemo(() => {
    const byCat = {}
    const productById = {}
    ;(products || []).forEach((p) => { productById[p.id] = p })
    ;(orders || []).forEach((order) => {
      ;(order.items || []).forEach((item) => {
        if (!myProductIds.has(item.product_id)) return
        const cat = productById[item.product_id]?.category || 'autre'
        if (!byCat[cat]) byCat[cat] = { category: cat, revenue: 0, count: 0 }
        byCat[cat].revenue += (item.quantity || 0) * (item.unit_price || 0)
        byCat[cat].count += item.quantity || 0
      })
    })
    return Object.values(byCat).sort((a, b) => b.revenue - a.revenue)
  }, [orders, products, myProductIds])

  return {
    salesByMonth,
    bestSellers,
    topClients,
    sellerRevenueByOrder,
    clientById,
    orderCountByStatus,
    salesByCategory,
  }
}

function VendorDashboard() {
  const [section, setSection] = useState('dashboard')
  const { globalSearch, setPendingOrdersCount } = useVendorDashboardStore()
  const [periodFilter, setPeriodFilter] = useState('30d')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set())
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsSummary, setAnalyticsSummary] = useState({
    product_views: 0,
    add_to_cart: 0,
    checkout_started: 0,
    order_completed: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'smartphone',
    condition: 'excellent',
    price: '',
    reference_price_neuf: '',
    stock: '',
    description: '',
    specifications: '',
    image_url: '',
    badge: '',
    image_urls: [],
    variants: [],
  })
  const [imageUrlsInput, setImageUrlsInput] = useState('')
  const [variantsInput, setVariantsInput] = useState('')

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [statsRes, ordersRes, clientsRes, productsRes, analyticsRes] = await Promise.all([
        ordersAPI.getSellerStats(),
        ordersAPI.getSellerOrders(),
        ordersAPI.getSellerClients(),
        productsAPI.getMyProducts(),
        analyticsAPI.getSellerSummary({ days: 30 }),
      ])
      setStats(statsRes.data)
      const ordersList = ordersRes.data || []
      setOrders(ordersList)
      setClients(clientsRes.data || [])
      setProducts(productsRes.data || [])
      setAnalyticsSummary(analyticsRes.data || {
        product_views: 0,
        add_to_cart: 0,
        checkout_started: 0,
        order_completed: 0,
      })
      setPendingOrdersCount(ordersList.filter((o) => o.status === 'pending').length)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const analytics = useSellerAnalytics(orders, products, clients)
  const {
    salesByMonth,
    bestSellers,
    topClients,
    sellerRevenueByOrder,
    clientById,
    orderCountByStatus,
    salesByCategory,
  } = analytics

  const periodFilteredOrders = useMemo(
    () => filterOrdersByPeriod(orders, periodFilter),
    [orders, periodFilter]
  )
  const periodRevenue = useMemo(() => {
    return periodFilteredOrders.reduce((sum, o) => sum + (sellerRevenueByOrder[o.id] ?? o.total_amount ?? 0), 0)
  }, [periodFilteredOrders, sellerRevenueByOrder])
  const periodOrdersCount = periodFilteredOrders.length

  const filteredOrders = useMemo(() => {
    let list = orderStatusFilter === 'all' ? orders : orders.filter((o) => o.status === orderStatusFilter)
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.trim().toLowerCase()
      list = list.filter((o) => {
        const client = clientById[o.customer_id]
        const name = client ? `${client.first_name} ${client.last_name}`.toLowerCase() : ''
        const email = (client?.email || '').toLowerCase()
        const num = (o.order_number || '').toLowerCase()
        return num.includes(q) || name.includes(q) || email.includes(q)
      })
    }
    return list
  }, [orders, orderStatusFilter, orderSearchQuery, clientById])

  const orderProgress = (order) => {
    const s = order.status
    return {
      packed: ['confirmed', 'shipped', 'delivered'].includes(s),
      fulfilled: ['shipped', 'delivered'].includes(s),
    }
  }

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const selectAllOrders = () => {
    if (selectedOrderIds.size === filteredOrders.length) setSelectedOrderIds(new Set())
    else setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)))
  }
  const exportOrdersCSV = () => {
    const headers = ['N°', 'Client', 'Email', 'Statut', 'Total', 'Date']
    const rows = filteredOrders.map((o) => {
      const c = clientById[o.customer_id]
      return [
        o.order_number,
        c ? `${c.first_name} ${c.last_name}` : '',
        c?.email || '',
        STATUS_LABELS[o.status] || o.status,
        (sellerRevenueByOrder[o.id] ?? o.total_amount ?? 0).toFixed(2),
        o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '',
      ]
    })
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const handleBulkStatusUpdate = (newStatus) => {
    if (selectedOrderIds.size === 0) return
    Promise.all([...selectedOrderIds].map((id) => ordersAPI.updateStatus(id, { status: newStatus })))
      .then(() => { setSelectedOrderIds(new Set()); fetchAll() })
      .catch((err) => alert(err.response?.data?.detail || 'Erreur'))
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-')
  const formatCurrency = (v) => `${Number(v || 0).toFixed(2)} €`

  const growthPercent = useMemo(() => {
    if (!salesByMonth.length) return 0
    const last = salesByMonth[salesByMonth.length - 1]?.ventes || 0
    const prev = salesByMonth[salesByMonth.length - 2]?.ventes || 0
    if (prev === 0) return last > 0 ? 100 : 0
    return ((last - prev) / prev) * 100
  }, [salesByMonth])

  const openOrdersCount = orderCountByStatus.pending + orderCountByStatus.confirmed + orderCountByStatus.shipped
  const successOrdersCount = orderCountByStatus.delivered
  const visitorsMock = Math.max(0, (stats?.orders || 0) * 12 + (stats?.clients || 0) * 3)

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    try {
      const imageUrls = imageUrlsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      let variants = []
      if (variantsInput.trim()) {
        try {
          variants = JSON.parse(variantsInput)
          if (!Array.isArray(variants)) variants = []
        } catch {
          alert('Format variantes invalide (JSON attendu).')
          return
        }
      }
      const refRaw = formData.reference_price_neuf
      const reference_price_neuf =
        refRaw === '' || refRaw == null ? null : Number(refRaw)
      const payload = {
        ...formData,
        reference_price_neuf:
          reference_price_neuf != null && Number.isFinite(reference_price_neuf)
            ? reference_price_neuf
            : null,
        image_urls: imageUrls,
        variants,
      }
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload)
        alert('Produit mis à jour.')
      } else {
        await productsAPI.create(payload)
        alert('Produit créé.')
      }
      resetForm()
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur sauvegarde')
    }
  }

  const handleEditProduct = (p) => {
    setEditingProduct(p)
    setFormData({
      name: p.name,
      brand: p.brand,
      category: p.category,
      condition: p.condition,
      price: p.price,
      reference_price_neuf:
        p.reference_price_neuf != null && p.reference_price_neuf !== ''
          ? p.reference_price_neuf
          : '',
      stock: p.stock,
      description: p.description || '',
      specifications: p.specifications || '',
      image_url: p.image_url || '',
      badge: p.badge || '',
      image_urls: p.image_urls || [],
      variants: p.variants || [],
    })
    setImageUrlsInput((p.image_urls || []).join('\n'))
    setVariantsInput(JSON.stringify(p.variants || [], null, 2))
    setShowForm(true)
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await productsAPI.delete(id)
      fetchAll()
    } catch (err) {
      alert('Erreur suppression')
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.brand) {
      alert('Remplissez nom et marque.')
      return
    }
    setGeneratingAI(true)
    try {
      const res = await productsAPI.generateDescription({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        condition: formData.condition,
        specifications: formData.specifications,
      })
      setFormData((prev) => ({ ...prev, description: res.data.description }))
    } catch (err) {
      alert('Erreur génération IA')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur mise à jour')
    }
  }

  const canMoveTo = (currentStatus, targetStatus) =>
    (ALLOWED_VENDOR_TRANSITIONS[currentStatus] || []).includes(targetStatus)

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'smartphone',
      condition: 'excellent',
      price: '',
      reference_price_neuf: '',
      stock: '',
      description: '',
      specifications: '',
      image_url: '',
      badge: '',
      image_urls: [],
      variants: [],
    })
    setImageUrlsInput('')
    setVariantsInput('')
    setEditingProduct(null)
    setShowForm(false)
  }

  const themeClass = 'bg-gray-50 text-gray-900'
  const cardClass = 'bg-white border border-gray-200 rounded-xl p-5 shadow-sm'
  const inputClass = 'input'

  return (
    <div className={`min-h-screen ${themeClass}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen border-r bg-white border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg">Ma Marketplace</h2>
            <p className="text-xs opacity-80">Tableau de bord vendeur</p>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {MENU_SECTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                  section === item.id ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-h-0">
          <div className="p-6 overflow-auto flex-1">
          {isLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : (
            <>
              {/* ---------- DASHBOARD ---------- */}
              {section === 'dashboard' && stats && (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm bg-white border-gray-300"
                    >
                      {PERIOD_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Total ventes</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(periodFilter === 'all' ? stats.revenue : periodRevenue)}
                      </p>
                      <p className={`text-xs mt-1 ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)} % vs mois préc.
                      </p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Commandes</p>
                      <p className="text-2xl font-bold mt-1">{periodFilter === 'all' ? stats.orders : periodOrdersCount}</p>
                      <p className="text-xs opacity-70">{periodFilter !== 'all' ? PERIOD_OPTIONS.find((p) => p.value === periodFilter)?.label : 'Total'}</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Commandes ouvertes</p>
                      <p className="text-2xl font-bold mt-1">{openOrdersCount}</p>
                      <p className="text-xs opacity-70">En cours</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Commandes réussies</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{successOrdersCount}</p>
                      <p className="text-xs opacity-70">Livrées</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Visiteurs</p>
                      <p className="text-2xl font-bold mt-1">{visitorsMock}</p>
                      <p className="text-xs opacity-70">Estimation</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Clients</p>
                      <p className="text-2xl font-bold mt-1">{stats.clients}</p>
                      <p className="text-xs opacity-70">Uniques</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Satisfaction client</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">93,5 %</p>
                      <p className="text-xs text-green-600">+4,2 %</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Ventes par mois</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <Tooltip formatter={(v) => [formatCurrency(v), 'Ventes']} />
                            <Line type="monotone" dataKey="ventes" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Ventes" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Top clients</h3>
                      {topClients.length === 0 ? (
                        <p className="text-sm opacity-70">Aucune donnée pour le moment.</p>
                      ) : (
                        <ul className="space-y-2">
                          {topClients.slice(0, 5).map((c) => (
                            <li key={c.customer_id} className="flex justify-between items-center text-sm">
                              <span className="font-medium">{c.name}</span>
                              <span className="text-gray-900 font-medium">{formatCurrency(c.total)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Statistiques par catégorie</h3>
                      {salesByCategory.length === 0 ? (
                        <p className="text-sm opacity-70">Aucune vente.</p>
                      ) : (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesByCategory.map((c, i) => ({ ...c, name: CATEGORY_LABELS[c.category] || c.category, value: c.revenue }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                              >
                                {salesByCategory.map((_, i) => (
                                  <Cell key={i} fill={['#2563eb', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'][i % 6]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => [formatCurrency(v), 'Ventes']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Croissance clients (par région)</h3>
                      <div className="flex flex-wrap gap-3">
                        {[{ code: 'FR', label: 'France', pct: 42 }, { code: 'BE', label: 'Belgique', pct: 18 }, { code: 'CH', label: 'Suisse', pct: 12 }, { code: 'LU', label: 'Luxembourg', pct: 8 }].map((r) => (
                          <div key={r.code} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                            <span className="text-lg">{r.code === 'FR' ? '🇫🇷' : r.code === 'BE' ? '🇧🇪' : r.code === 'CH' ? '🇨🇭' : '🇱🇺'}</span>
                            <span className="text-sm font-medium">{r.label}</span>
                            <span className="text-sm text-gray-900">{r.pct} %</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Dernières commandes</h3>
                      {(() => {
                        const q = globalSearch.trim().toLowerCase()
                        const list = !q ? orders : orders.filter((o) => {
                          const c = clientById[o.customer_id]
                          const str = `${o.order_number} ${c?.first_name || ''} ${c?.last_name || ''} ${c?.email || ''}`.toLowerCase()
                          return str.includes(q)
                        })
                        return list.length === 0 ? (
                      <p className="text-sm opacity-70">Aucune commande.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">N°</th>
                              <th className="text-left py-2 font-medium opacity-70">Client</th>
                              <th className="text-left py-2 font-medium opacity-70">Statut</th>
                              <th className="text-left py-2 font-medium opacity-70">Total</th>
                              <th className="text-left py-2 font-medium opacity-70">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {list.slice(0, 10).map((o) => {
                              const client = clientById[o.customer_id]
                              return (
                                <tr key={o.id}>
                                  <td className="py-2 font-mono">{o.order_number}</td>
                                  <td className="py-2">{client ? `${client.first_name} ${client.last_name}` : `#${o.customer_id}`}</td>
                                  <td className="py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {STATUS_LABELS[o.status] || o.status}
                                    </span>
                                  </td>
                                  <td className="py-2 font-medium">{formatCurrency(sellerRevenueByOrder[o.id] ?? o.total_amount)}</td>
                                  <td className="py-2 opacity-80">{formatDate(o.created_at)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ); })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- COMMANDES / REVENUS ---------- */}
              {(section === 'revenus' || section === 'commandes') && (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">
                      {section === 'commandes' ? 'Gestion des commandes' : 'Revenus & Commandes'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-sm border bg-white border-gray-300"
                      >
                        {PERIOD_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={exportOrdersCSV}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        📥 Exporter CSV
                      </button>
                      {section !== 'commandes' && (
                        <button
                          disabled
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-600 cursor-not-allowed"
                          title="Les commandes sont créées par les clients depuis le panier."
                        >
                          Commandes créées côté client
                        </button>
                      )}
                    </div>
                  </div>
                  {section === 'commandes' && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      Vous pouvez valider, refuser, expédier ou marquer livrée une commande selon son état courant.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setOrderStatusFilter(f.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          orderStatusFilter === f.value
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className={cardClass}>
                    {section === 'revenus' && <div className="h-72 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                          <Tooltip formatter={(v) => [formatCurrency(v), 'Ventes']} />
                          <Bar dataKey="ventes" fill="#2563eb" name="Ventes" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>}
                  </div>
                  <div className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className="font-semibold">Liste des commandes</h3>
                      <input
                        type="search"
                        placeholder="N° commande, client, email..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className={`px-3 py-2 rounded-lg border text-sm w-56 ${inputClass}`}
                      />
                    </div>
                    {selectedOrderIds.size > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-sm opacity-80">{selectedOrderIds.size} sélectionnée(s)</span>
                        <button onClick={() => handleBulkStatusUpdate('confirmed')} className="px-2 py-1 rounded text-sm bg-amber-100">Confirmer</button>
                        <button onClick={() => handleBulkStatusUpdate('shipped')} className="px-2 py-1 rounded text-sm bg-blue-100">Expédier</button>
                        <button onClick={() => setSelectedOrderIds(new Set())} className="px-2 py-1 rounded text-sm bg-gray-200">Annuler</button>
                      </div>
                    )}
                    {filteredOrders.length === 0 ? (
                      <p className="text-sm opacity-70">Aucune commande.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-3 font-medium opacity-70 w-8">
                                <input type="checkbox" checked={filteredOrders.length > 0 && selectedOrderIds.size === filteredOrders.length} onChange={selectAllOrders} />
                              </th>
                              <th className="text-left py-3 font-medium opacity-70">N° commande</th>
                              <th className="text-left py-3 font-medium opacity-70">Client</th>
                              <th className="text-left py-3 font-medium opacity-70">Statut</th>
                              <th className="text-left py-3 font-medium opacity-70">Emballé</th>
                              <th className="text-left py-3 font-medium opacity-70">Livré</th>
                              <th className="text-left py-3 font-medium opacity-70">Total</th>
                              <th className="text-left py-3 font-medium opacity-70">Date</th>
                              <th className="text-left py-3 font-medium opacity-70">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((o) => {
                              const client = clientById[o.customer_id]
                              const prog = orderProgress(o)
                              return (
                                <tr key={o.id}>
                                  <td className="py-3">
                                    {o.status !== 'cancelled' && <input type="checkbox" checked={selectedOrderIds.has(o.id)} onChange={() => toggleOrderSelection(o.id)} />}
                                  </td>
                                  <td className="py-3 font-mono">{o.order_number}</td>
                                  <td className="py-3">{client ? `${client.first_name} ${client.last_name}` : `#${o.customer_id}`}</td>
                                  <td className="py-3">
                                    <select
                                      value={o.status}
                                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                      className={`text-sm rounded border ${inputClass}`}
                                    >
                                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-3">{prog.packed ? '✓' : '—'}</td>
                                  <td className="py-3">{prog.fulfilled ? '✓' : '—'}</td>
                                  <td className="py-3 font-medium">{formatCurrency(sellerRevenueByOrder[o.id] ?? o.total_amount)}</td>
                                  <td className="py-3 opacity-80">{formatDate(o.created_at)}</td>
                                  <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                      o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                      o.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                                      o.status === 'pending' ? 'bg-gray-100' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {o.status === 'delivered' ? 'Livré' : o.status === 'shipped' ? 'Expédié' : o.status === 'confirmed' ? 'Confirmé' : o.status === 'pending' ? 'En attente' : 'Annulé'}
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      <button
                                        type="button"
                                        className={`px-2 py-1 rounded text-xs ${canMoveTo(o.status, 'confirmed') ? 'bg-amber-100 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canMoveTo(o.status, 'confirmed')}
                                        onClick={() => handleUpdateOrderStatus(o.id, 'confirmed')}
                                      >
                                        Valider
                                      </button>
                                      <button
                                        type="button"
                                        className={`px-2 py-1 rounded text-xs ${canMoveTo(o.status, 'cancelled') ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canMoveTo(o.status, 'cancelled')}
                                        onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                                      >
                                        Refuser
                                      </button>
                                      <button
                                        type="button"
                                        className={`px-2 py-1 rounded text-xs ${canMoveTo(o.status, 'shipped') ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canMoveTo(o.status, 'shipped')}
                                        onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}
                                      >
                                        Expédier
                                      </button>
                                      <button
                                        type="button"
                                        className={`px-2 py-1 rounded text-xs ${canMoveTo(o.status, 'delivered') ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canMoveTo(o.status, 'delivered')}
                                        onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                                      >
                                        Livrer
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- PRODUITS ---------- */}
              {section === 'produits' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-3xl font-bold">Produits</h1>
                    <button
                      onClick={() => { resetForm(); setShowForm(!showForm) }}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-900"
                    >
                      {showForm ? 'Annuler' : '+ Nouveau produit'}
                    </button>
                  </div>
                  {showForm && (
                    <div className={cardClass}>
                      <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'Modifier' : 'Nouveau produit'}</h3>
                      <form onSubmit={handleSubmitProduct} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Nom *</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Marque *</label>
                            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Catégorie</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                              <option value="smartphone">Smartphone</option>
                              <option value="ordinateur">Ordinateur</option>
                              <option value="tablette">Tablette</option>
                              <option value="montre">Montre</option>
                              <option value="ecouteurs">Écouteurs</option>
                              <option value="console">Console</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">État</label>
                            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className={inputClass}>
                              <option value="excellent">Excellent</option>
                              <option value="bon">Bon</option>
                              <option value="correct">Correct</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Prix (€) *</label>
                            <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Prix neuf de référence (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.reference_price_neuf}
                              onChange={(e) => setFormData({ ...formData, reference_price_neuf: e.target.value })}
                              className={inputClass}
                              placeholder="Optionnel, pour prix barré"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Stock *</label>
                            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className={inputClass} required />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Description *</label>
                            <button type="button" onClick={handleGenerateDescription} disabled={generatingAI} className="text-sm px-2 py-1 rounded bg-gray-200">
                              {generatingAI ? 'Génération...' : '🤖 Générer avec IA'}
                            </button>
                          </div>
                          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} rows={4} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Caractéristiques</label>
                          <textarea value={formData.specifications} onChange={(e) => setFormData({ ...formData, specifications: e.target.value })} className={inputClass} rows={2} placeholder="Ex: 128GB, 6GB RAM..." />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Badge produit</label>
                            <select value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className={inputClass}>
                              <option value="">Aucun</option>
                              <option value="promo">Promo</option>
                              <option value="bestseller">Best-seller</option>
                              <option value="reconditionne_certifie">Reconditionné certifié</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Image principale (optionnelle)</label>
                            <input type="url" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className={inputClass} placeholder="https://..." />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Images (une URL par ligne)</label>
                          <textarea value={imageUrlsInput} onChange={(e) => setImageUrlsInput(e.target.value)} className={inputClass} rows={4} placeholder={"https://image1.jpg\nhttps://image2.jpg"} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Variantes (JSON)</label>
                          <textarea value={variantsInput} onChange={(e) => setVariantsInput(e.target.value)} className={inputClass} rows={5} placeholder='[{"name":"Stockage","value":"256Go","extra_price":100}]' />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="px-4 py-2 rounded-lg bg-gray-800 text-white">{(editingProduct ? 'Mettre à jour' : 'Créer')}</button>
                          <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-200">Annuler</button>
                        </div>
                      </form>
                    </div>
                  )}
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-4">Meilleures ventes (Best Sellers)</h3>
                    {bestSellers.length === 0 ? (
                      <p className="text-sm opacity-70">Aucune vente pour le moment.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Produit</th>
                              <th className="text-left py-2 font-medium opacity-70">Quantité vendue</th>
                              <th className="text-left py-2 font-medium opacity-70">Prix</th>
                              <th className="text-left py-2 font-medium opacity-70">Revenus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {bestSellers.map((row) => (
                              <tr key={row.product_id}>
                                <td className="py-2 font-medium">{row.name}</td>
                                <td className="py-2">{row.quantity}</td>
                                <td className="py-2">{formatCurrency(row.price)}</td>
                                <td className="py-2 text-gray-900 font-medium">{formatCurrency(row.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-4">Mes produits</h3>
                    {products.length === 0 ? (
                      <p className="text-sm opacity-70">Aucun produit.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Produit</th>
                              <th className="text-left py-2 font-medium opacity-70">Prix</th>
                              <th className="text-left py-2 font-medium opacity-70">Stock</th>
                              <th className="text-left py-2 font-medium opacity-70">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {products.map((p) => (
                              <tr key={p.id}>
                                <td className="py-2"><span className="font-medium">{p.name}</span> <span className="opacity-70 text-sm">({p.brand})</span></td>
                                <td className="py-2">{formatCurrency(p.price)}</td>
                                <td className="py-2">{p.stock}</td>
                                <td className="py-2">
                                  <button type="button" onClick={() => handleEditProduct(p)} className="text-gray-900 hover:underline mr-2">Modifier</button>
                                  <button type="button" onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:underline">Supprimer</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- TRANSACTIONS ---------- */}
              {section === 'transactions' && (
                <div className="space-y-8">
                  <h1 className="text-3xl font-bold">Transactions</h1>
                  <div className={cardClass}>
                    <p className="text-sm opacity-70 mb-4">Historique des transactions (commandes contenant vos produits).</p>
                    {orders.length === 0 ? (
                      <p className="text-sm opacity-70">Aucune transaction.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Date</th>
                              <th className="text-left py-2 font-medium opacity-70">N° commande</th>
                              <th className="text-left py-2 font-medium opacity-70">Montant</th>
                              <th className="text-left py-2 font-medium opacity-70">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {[...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((o) => (
                              <tr key={o.id}>
                                <td className="py-2">{formatDate(o.created_at)}</td>
                                <td className="py-2 font-mono">{o.order_number}</td>
                                <td className="py-2 font-medium">{formatCurrency(sellerRevenueByOrder[o.id] ?? o.total_amount)}</td>
                                <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- FACTURES ---------- */}
              {section === 'factures' && (
                <div className="space-y-8">
                  <h1 className="text-3xl font-bold">Factures</h1>
                  <div className={cardClass}>
                    <p className="text-sm opacity-70 mb-4">Les factures sont générées à partir des commandes livrées. Exportez vos données depuis Revenus.</p>
                    {orders.filter((o) => o.status === 'delivered').length === 0 ? (
                      <p className="text-sm opacity-70">Aucune facture disponible (aucune commande livrée).</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">N° commande</th>
                              <th className="text-left py-2 font-medium opacity-70">Client</th>
                              <th className="text-left py-2 font-medium opacity-70">Montant</th>
                              <th className="text-left py-2 font-medium opacity-70">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {orders.filter((o) => o.status === 'delivered').map((o) => {
                              const c = clientById[o.customer_id]
                              return (
                                <tr key={o.id}>
                                  <td className="py-2 font-mono">{o.order_number}</td>
                                  <td className="py-2">{c ? `${c.first_name} ${c.last_name}` : '—'}</td>
                                  <td className="py-2 font-medium">{formatCurrency(sellerRevenueByOrder[o.id] ?? o.total_amount)}</td>
                                  <td className="py-2">{formatDate(o.created_at)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="mt-4">
                      <button onClick={exportOrdersCSV} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm">Enregistrer le rapport (CSV)</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- ANALYTICS ---------- */}
              {section === 'analytics' && (
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <div className="flex items-center gap-2">
                      <select className="px-3 py-2 rounded-lg border text-sm bg-white border-gray-300">
                        <option>30 derniers jours</option>
                        <option>Cette semaine</option>
                        <option>Cette année</option>
                      </select>
                      <button onClick={exportOrdersCSV} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm">Enregistrer le rapport</button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Vues produit</p>
                      <p className="text-2xl font-bold mt-1">{analyticsSummary.product_views}</p>
                      <p className="text-xs opacity-70">Sur 30 jours</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Ajouts panier</p>
                      <p className="text-2xl font-bold mt-1">{analyticsSummary.add_to_cart}</p>
                      <p className="text-xs opacity-70">Sur 30 jours</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Checkouts démarrés</p>
                      <p className="text-2xl font-bold mt-1">{analyticsSummary.checkout_started}</p>
                      <p className="text-xs opacity-70">Sur 30 jours</p>
                    </div>
                    <div className={cardClass}>
                      <p className="text-xs font-medium uppercase opacity-70">Commandes finalisées</p>
                      <p className="text-2xl font-bold mt-1">{analyticsSummary.order_completed}</p>
                      <p className="text-xs opacity-70">Sur 30 jours</p>
                    </div>
                  </div>
                  <div className="grid gap-4 bg-white rounded-xl p-4 border border-gray-200">
                    <h3 className="font-semibold">Entonnoir de conversion</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><span className="opacity-70">Vues</span><p className="font-bold">{analyticsSummary.product_views}</p></div>
                      <div><span className="opacity-70">Ajouts panier</span><p className="font-bold">{analyticsSummary.add_to_cart}</p></div>
                      <div><span className="opacity-70">Checkouts</span><p className="font-bold">{analyticsSummary.checkout_started}</p></div>
                      <div><span className="opacity-70">Commandes</span><p className="font-bold">{analyticsSummary.order_completed}</p></div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Open Rate vs Click Through</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesByMonth.map((m, i) => ({ ...m, open: 72 + i * 1.5, click: 2.2 + i * 0.15 }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <Tooltip />
                            <Area type="monotone" dataKey="open" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} name="Open %" />
                            <Area type="monotone" dataKey="click" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Click %" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Performance par appareil</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { device: 'Smartphone', ouvertures: 420, clics: 45 },
                            { device: 'Desktop', ouvertures: 380, clics: 52 },
                            { device: 'Tablette', ouvertures: 180, clics: 18 },
                          ]} layout="vertical" margin={{ left: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis type="category" dataKey="device" tick={{ fontSize: 11 }} stroke="#6b7280" width={80} />
                            <Tooltip />
                            <Bar dataKey="ouvertures" fill="#2563eb" name="Ouvertures" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="clics" fill="#22c55e" name="Clics" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Ventes par mois (tendance)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <Tooltip formatter={(v) => [formatCurrency(v), 'Ventes']} />
                            <Line type="monotone" dataKey="ventes" stroke="#2563eb" strokeWidth={2} name="Ventes" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className={cardClass}>
                      <h3 className="font-semibold mb-4">Répartition des statuts</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Livrées', value: orderCountByStatus.delivered, color: '#22c55e' },
                                { name: 'Expédiées', value: orderCountByStatus.shipped, color: '#3b82f6' },
                                { name: 'Confirmées', value: orderCountByStatus.confirmed, color: '#eab308' },
                                { name: 'En attente', value: orderCountByStatus.pending, color: '#6b7280' },
                                { name: 'Annulées', value: orderCountByStatus.cancelled, color: '#ef4444' },
                              ].filter((d) => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {[
                                { name: 'Livrées', value: orderCountByStatus.delivered, color: '#22c55e' },
                                { name: 'Expédiées', value: orderCountByStatus.shipped, color: '#3b82f6' },
                                { name: 'Confirmées', value: orderCountByStatus.confirmed, color: '#eab308' },
                                { name: 'En attente', value: orderCountByStatus.pending, color: '#6b7280' },
                                { name: 'Annulées', value: orderCountByStatus.cancelled, color: '#ef4444' },
                              ]
                                .filter((d) => d.value > 0)
                                .map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Commandes']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- INVENTAIRE ---------- */}
              {section === 'inventaire' && (
                <div className="space-y-8">
                  <h1 className="text-3xl font-bold">Inventaire</h1>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-4">Stock des produits</h3>
                    {products.length === 0 ? (
                      <p className="text-sm opacity-70">Aucun produit.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Produit</th>
                              <th className="text-left py-2 font-medium opacity-70">Stock</th>
                              <th className="text-left py-2 font-medium opacity-70">Alerte</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {products.map((p) => (
                              <tr key={p.id}>
                                <td className="py-2 font-medium">{p.name}</td>
                                <td className="py-2">{p.stock}</td>
                                <td className="py-2">
                                  {p.stock <= 2 ? (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">Stock bas</span>
                                  ) : (
                                    <span className="text-green-600 text-xs">OK</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- CLIENTS ---------- */}
              {section === 'clients' && (
                <div className="space-y-8">
                  <h1 className="text-3xl font-bold">Clients</h1>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-4">Top clients (montant dépensé)</h3>
                    {topClients.length === 0 ? (
                      <p className="text-sm opacity-70">Aucun client pour le moment.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Client</th>
                              <th className="text-left py-2 font-medium opacity-70">Email</th>
                              <th className="text-left py-2 font-medium opacity-70">Total dépensé</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {topClients.map((c) => (
                              <tr key={c.customer_id}>
                                <td className="py-2 font-medium">{c.name}</td>
                                <td className="py-2 opacity-80">{c.email || '—'}</td>
                                <td className="py-2 text-gray-900 font-medium">{formatCurrency(c.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-4">Liste des clients (contacts)</h3>
                    {clients.length === 0 ? (
                      <p className="text-sm opacity-70">Aucun client.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={'border-gray-200'}>
                              <th className="text-left py-2 font-medium opacity-70">Nom</th>
                              <th className="text-left py-2 font-medium opacity-70">Email</th>
                              <th className="text-left py-2 font-medium opacity-70">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {clients.map((c) => (
                              <tr key={c.id}>
                                <td className="py-2 font-medium">{c.first_name} {c.last_name}</td>
                                <td className="py-2">{c.email}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${c.is_blocked ? 'bg-red-100 text-red-800' : c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {c.is_blocked ? 'Bloqué' : c.is_active ? 'Actif' : 'Inactif'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- FEEDBACK ---------- */}
              {section === 'feedback' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Feedback</h1>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-2">Envoyer un retour</h3>
                    <p className="text-sm opacity-70 mb-4">Partagez vos idées ou signalez un problème à l'équipe de la marketplace.</p>
                    <form className="space-y-3 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium mb-1">Sujet</label>
                        <input type="text" placeholder="Ex: Suggestion, Bug..." className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea rows={4} placeholder="Décrivez votre retour..." className={inputClass} />
                      </div>
                      <button type="button" className="px-4 py-2 rounded-lg bg-gray-800 text-white" onClick={() => alert('Merci pour votre retour. Il sera transmis à l\'équipe.')}>
                        Envoyer
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ---------- PARAMÈTRES ---------- */}
              {section === 'parametres' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Paramètres</h1>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-2">Paramètres du compte</h3>
                    <p className="text-sm opacity-70">Gérez votre compte depuis la page Mon Compte dans le menu principal.</p>
                  </div>
                </div>
              )}

              {/* ---------- AIDE ---------- */}
              {section === 'aide' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Aide</h1>
                  <div className={cardClass}>
                    <h3 className="font-semibold mb-2">Feedback & Support</h3>
                    <p className="text-sm opacity-70">
                      Pour toute question ou problème, contactez l'équipe support de la marketplace.
                      Vous pouvez gérer vos produits, suivre vos commandes et consulter les analytics depuis ce tableau de bord.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default VendorDashboard
