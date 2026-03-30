import { create } from 'zustand'
import { wishlistAPI } from '../services/api'
import { useAuthStore } from './authStore'

/** Même clé que l’historique pour compatibilité avec les favoris déjà enregistrés. */
const STORAGE_KEY = 'wishlist_ids'

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export const useWishlistStore = create((set, get) => ({
  ids: readIds(),

  /** Recharge depuis localStorage ou backend si connecté. */
  hydrate: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      set({ ids: readIds() })
      return
    }
    try {
      const response = await wishlistAPI.getIds()
      const ids = Array.isArray(response.data) ? response.data : []
      writeIds(ids)
      set({ ids })
    } catch {
      set({ ids: readIds() })
    }
  },

  toggle: async (productId) => {
    const cur = get().ids
    const next = cur.includes(productId)
      ? cur.filter((id) => id !== productId)
      : [...cur, productId]
    writeIds(next)
    set({ ids: next })
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) return
    try {
      if (cur.includes(productId)) {
        await wishlistAPI.remove(productId)
      } else {
        await wishlistAPI.add(productId)
      }
    } catch {
      writeIds(cur)
      set({ ids: cur })
    }
  },

  remove: async (productId) => {
    const cur = get().ids
    const next = cur.filter((id) => id !== productId)
    writeIds(next)
    set({ ids: next })
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) return
    try {
      await wishlistAPI.remove(productId)
    } catch {
      writeIds(cur)
      set({ ids: cur })
    }
  },

  has: (productId) => get().ids.includes(productId),
}))
