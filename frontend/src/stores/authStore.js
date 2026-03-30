import { create } from 'zustand'
import { authAPI } from '../services/api'

// Extrait un message lisible depuis une erreur API (detail peut être string ou tableau)
function getErrorMessage(error, fallback = 'Erreur de connexion') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    return first?.msg || first?.message || JSON.stringify(first)
  }
  if (error?.response?.status === 401) return 'Email ou mot de passe incorrect.'
  if (error?.response?.status === 403) return typeof detail === 'string' ? detail : 'Compte désactivé ou bloqué.'
  // Network Error = le backend ne répond pas (pas démarré ou mauvais port)
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Le serveur ne répond pas. Démarrez le backend : dans le dossier backend, lancez "uvicorn app.main:app --reload" (port 8000).'
  }
  if (error?.message) return error.message
  return fallback
}

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
          : getErrorMessage(meError, 'Erreur après connexion.')
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
      const msg = getErrorMessage(error, 'Erreur de connexion.')
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
        error: error.response?.data?.detail || 'Erreur lors de l\'inscription',
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

    try {
      const response = await authAPI.getMe()
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
