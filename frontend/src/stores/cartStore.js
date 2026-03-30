import { create } from 'zustand'
import { cartAPI } from '../services/api'

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await cartAPI.getCart()
      set({ items: response.data, isLoading: false })
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Erreur lors du chargement du panier',
        isLoading: false,
      })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity })
      await get().fetchCart()
      return true
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Erreur lors de l\'ajout au panier' })
      return false
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      await cartAPI.updateCartItem(itemId, { quantity })
      await get().fetchCart()
      return true
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Erreur lors de la mise à jour' })
      return false
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId)
      await get().fetchCart()
      return true
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Erreur lors de la suppression' })
      return false
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clearCart()
      set({ items: [] })
      return true
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Erreur lors du vidage du panier' })
      return false
    }
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0)
  },
}))
