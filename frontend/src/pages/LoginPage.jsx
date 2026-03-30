import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'vendeur') navigate('/vendor/dashboard', { replace: true })
      else navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ email, password })
    // La redirection est gérée par le useEffect (selon le rôle : admin -> dashboard, etc.)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Connexion
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-100 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-2">
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-gray-800 font-medium hover:underline">
            S'inscrire
          </Link>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Comptes de test</p>
          <p className="text-xs text-gray-500">
            Admin : admin@marketplace.com / admin123<br />
            Vendeur : vendeur@marketplace.com / vendeur123<br />
            Client : client@marketplace.com / client123
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
