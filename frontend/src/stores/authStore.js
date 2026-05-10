import { create } from 'zustand'
import { authAPI } from '../services/api'
import { getApiErrorMessage } from '../utils/apiErrors'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  authChecked: !localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(credentials)
      const { access_token } = response.data
      localStorage.setItem('token', access_token)

      try {
        const userResponse = await authAPI.getMe()
        const user = userResponse.data
        set({
          token: access_token,
          user,
          isAuthenticated: true,
          authChecked: true,
          isLoading: false,
          error: null,
        })
        return true
      } catch (meError) {
        localStorage.removeItem('token')
        const status = meError.response?.status
        const detail = meError.response?.data?.detail
        const isTokenError = status === 401 && (
          detail === 'Token invalide ou expiré' ||
          detail === 'Token invalide' ||
          (typeof detail === 'string' && detail.toLowerCase().includes('token'))
        )
        const msg = isTokenError
          ? 'Token refusé par le serveur. Redémarrez le backend, vérifiez que backend/.env contient SECRET_KEY, puis réessayez (Ctrl+Shift+R pour vider le cache).'
          : getApiErrorMessage(meError, 'Erreur après connexion.')
        if (process.env.NODE_ENV === 'development') {
          console.error('[Login getMe]', status, detail, meError.response?.data, meError.message)
        }
        set({
          error: msg,
          isLoading: false,
          isAuthenticated: false,
          authChecked: true,
          user: null,
          token: null,
        })
        return false
      }
    } catch (error) {
      localStorage.removeItem('token')
      const msg = getApiErrorMessage(error, 'Erreur de connexion.')
      if (process.env.NODE_ENV === 'development') {
        console.error('[Login]', error.response?.status, error.response?.data, error.message, error.code)
      }
      set({
        error: msg,
        isLoading: false,
        isAuthenticated: false,
        authChecked: true,
        user: null,
        token: null,
      })
      return false
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      await authAPI.register(userData)
      set({ 
        isLoading: false,
        error: null  // ✅ Réinitialiser l'erreur
      })
      return true
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Erreur lors de l'inscription"),
        isLoading: false,
      })
      return false
    }
  },
  
  // Nouvelle fonction pour effacer l'erreur manuellement
  clearError: () => {
    set({ error: null })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      authChecked: true,
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, authChecked: true })
      return
    }

    const timeoutMs = 15000
    try {
      const response = await Promise.race([
        authAPI.getMe(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session: délai dépassé (API injoignable ?)')), timeoutMs)
        ),
      ])
      set({
        user: response.data,
        isAuthenticated: true,
        authChecked: true,
      })
    } catch (error) {
      localStorage.removeItem('token')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authChecked: true,
      })
    }
  },
}))
