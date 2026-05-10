import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import App from './App'
import './index.css'
import { useAuthStore } from './stores/authStore'
import { useLocaleStore } from './stores/localeStore'

function AuthBootstrap({ children }) {
  const { checkAuth } = useAuthStore()
  const { locale } = useLocaleStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthBootstrap>
        <App />
      </AuthBootstrap>
    </BrowserRouter>
  </React.StrictMode>,
)
