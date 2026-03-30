import { create } from 'zustand'

const STORAGE_KEY = 'locale'

function readLocale() {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'en' ? 'en' : 'fr'
}

export const useLocaleStore = create((set) => ({
  locale: readLocale(),
  setLocale: (locale) => {
    const next = locale === 'en' ? 'en' : 'fr'
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
    set({ locale: next })
  },
}))
