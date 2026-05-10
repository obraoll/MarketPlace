/**
 * Message utilisateur à partir d'une erreur Axios / API.
 * Centralisé pour éviter les "Request failed with status code XXX" partout.
 */
export function getApiErrorMessage(error, fallback = 'Une erreur est survenue.') {
  const status = error?.response?.status
  const data = error?.response?.data
  const detail = data?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    return first?.msg || first?.message || JSON.stringify(first)
  }

  if (status === 404) {
    return (
      "L'API a répondu 404 (mauvaise URL ou proxy). Vérifiez : backend sur http://127.0.0.1:8000/docs , " +
      "puis redémarrez le frontend. En dernier recours, créez frontend/.env.development.local avec " +
      "VITE_API_URL=http://127.0.0.1:8000/api/v1"
    )
  }
  if (status === 401) return 'Email ou mot de passe incorrect.'
  if (status === 403) {
    return typeof detail === 'string' ? detail : 'Compte désactivé ou bloqué.'
  }
  if (status === 429) {
    return 'Trop de tentatives. Patientez une minute avant de réessayer.'
  }
  if (status === 503) {
    return typeof detail === 'string'
      ? detail
      : 'Service temporairement indisponible (souvent la base de données).'
  }
  if (status === 500 || status === 502 || status === 504) {
    if (typeof detail === 'string') {
      if (detail.includes('non JSON')) {
        return (
          detail +
          ' Astuce : ouvrez http://localhost:8000/docs et testez POST /auth/login ; si ça répond en JSON, ' +
          'redémarrez le backend (fermez la fenêtre « Backend », relancez TOUT_DEMARRER.bat) pour éviter un vieux processus sur le port 8000.'
        )
      }
      return detail
    }
    if (data && typeof data === 'object' && typeof data.message === 'string') {
      return data.message
    }
    return (
      'Erreur serveur. Vérifiez que MySQL (WAMP/XAMPP) est démarré, DATABASE_URL dans backend/.env, ' +
      'puis relancez uvicorn. Ouvrez http://localhost:8000/health/ready pour tester la base.'
    )
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Le serveur ne répond pas. Démarrez le backend (port 8000) et le frontend (Vite).'
  }
  if (error?.message) return error.message
  return fallback
}
