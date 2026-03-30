import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'client',
  })
  const [success, setSuccess] = useState(false)
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isSuccess = await register(formData)
    if (isSuccess) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Inscription
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-100 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-gray-50 text-gray-700 text-sm p-3 rounded border border-gray-200 mb-4">
            Inscription réussie. Redirection vers la connexion…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input">
              <option value="client">Client</option>
              <option value="vendeur">Vendeur</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-2">
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-gray-800 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
