import { useState } from 'react'

function TestLoginPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Test en cours...')
    
    const apiBase =
      import.meta.env.VITE_API_URL?.trim() ||
      (import.meta.env.DEV ? '/api/v1' : 'http://localhost:8000/api/v1')
    const healthUrl = import.meta.env.DEV ? '/health' : 'http://localhost:8000/health'

    try {
      // Test 1 : Vérifier le backend
      const healthResponse = await fetch(healthUrl)
      const healthData = await healthResponse.json()
      
      if (healthData.status !== 'healthy') {
        setResult('❌ Backend ne répond pas correctement')
        setLoading(false)
        return
      }
      
      // Test 2 : Tester le login
      const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@marketplace.com',
          password: 'admin123'
        })
      })
      
      const loginData = await loginResponse.json()
      
      if (!loginResponse.ok) {
        setResult(`❌ Erreur ${loginResponse.status}: ${JSON.stringify(loginData)}`)
        setLoading(false)
        return
      }
      
      if (!loginData.access_token) {
        setResult('❌ Pas de token reçu')
        setLoading(false)
        return
      }
      
      // Test 3 : Vérifier le token
      const meResponse = await fetch(`${apiBase}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      })
      
      const meData = await meResponse.json()
      
      if (!meResponse.ok) {
        setResult(`❌ Token invalide: ${JSON.stringify(meData)}`)
        setLoading(false)
        return
      }
      
      // Tout est OK !
      setResult(`✅ SUCCÈS ! Connexion fonctionne parfaitement !
      
Email: ${meData.email}
Nom: ${meData.first_name} ${meData.last_name}
Rôle: ${meData.role}

Le problème vient du localStorage.
      
SOLUTION :
1. Ouvrez la Console (F12)
2. Tapez : localStorage.clear()
3. Tapez : location.reload()
4. Reconnectez-vous normalement`)
      
    } catch (error) {
      setResult(`❌ Erreur réseau: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearLocalStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    alert('✅ Cache vidé ! La page va se recharger.')
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🔧 Page de Test - Connexion
        </h1>
        
        <p className="mb-6 text-gray-600">
          Cette page teste si le backend et la connexion fonctionnent correctement.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? '⏳ Test en cours...' : '🧪 Tester la Connexion'}
          </button>
          
          <button
            onClick={clearLocalStorage}
            className="btn btn-secondary w-full"
          >
            🗑️ Vider le Cache (localStorage)
          </button>
          
          <a href="/login" className="btn w-full text-center block">
            ← Retour à la connexion normale
          </a>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Instructions :</h3>
          <ol className="text-sm space-y-2 text-gray-700">
            <li>1. Cliquez sur "Vider le Cache"</li>
            <li>2. La page va se recharger</li>
            <li>3. Cliquez sur "Tester la Connexion"</li>
            <li>4. Si ça fonctionne → Retournez à la connexion normale</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default TestLoginPage
