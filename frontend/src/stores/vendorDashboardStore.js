import { create } from 'zustand'

export const useVendorDashboardStore = create((set) => ({
  globalSearch: '',
  setGlobalSearch: (value) => set({ globalSearch: value }),
  pendingOrdersCount: 0,
  setPendingOrdersCount: (count) => set({ pendingOrdersCount: count }),
}))
