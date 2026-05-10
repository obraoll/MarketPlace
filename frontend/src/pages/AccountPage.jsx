import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { accountAPI, supportAPI } from '../services/api'
import SeoHead from '../components/SeoHead'
import Breadcrumbs from '../components/Breadcrumbs'

function AccountPage() {
  const { user: currentUser, checkAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Données du profil
  const [profileData, setProfileData] = useState({
    email: '',
    first_name: '',
    last_name: '',
  })
  
  // Changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  
  const [message, setMessage] = useState({ type: '', text: '' })
  const [tickets, setTickets] = useState([])
  const [ticketForm, setTicketForm] = useState({
    channel: 'web',
    category: 'general',
    priority: 'normal',
    subject: '',
    message: '',
  })
  
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        email: currentUser.email || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
      })
    }
  }, [currentUser])

  useEffect(() => {
    if (activeTab === 'security') {
      supportAPI.getTickets().then((r) => setTickets(r.data || [])).catch(() => setTickets([]))
    }
  }, [activeTab])
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      await accountAPI.updateAccount(profileData)
      await checkAuth() // Rafraîchir les infos utilisateur
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' })
      setIsEditing(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la mise à jour'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    // Vérifier que les mots de passe correspondent
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    
    // Vérifier longueur minimum
    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }
    
    setIsSaving(true)
    
    try {
      await accountAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' })
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du changement de mot de passe'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action désactivera votre compte.')) {
      return
    }
    
    try {
      await accountAPI.deleteAccount()
      alert('Votre compte a été désactivé. Vous allez être déconnecté.')
      window.location.href = '/login'
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression du compte'
      })
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      await supportAPI.createTicket(ticketForm)
      setTicketForm({ channel: 'web', category: 'general', priority: 'normal', subject: '', message: '' })
      const res = await supportAPI.getTickets()
      setTickets(res.data || [])
      setMessage({ type: 'success', text: 'Ticket support créé.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Erreur création ticket' })
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SeoHead title="Mon compte - Marketplace" description="Gérez votre profil, sécurité et tickets support." canonicalPath="/account" />
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Mon Compte' }]} />
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Mon Compte</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'password'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Mot de passe
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'security'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Sécurité
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded border mb-4 text-sm ${
          message.type === 'success'
            ? 'bg-gray-50 text-gray-800 border-gray-200'
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-900">Informations du profil</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
              >
                ✏️ Modifier
              </button>
            )}
          </div>
          
          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">Prénom</label>
                <p className="text-sm text-gray-900">{currentUser?.first_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">Nom</label>
                <p className="text-sm text-gray-900">{currentUser?.last_name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">Email</label>
                <p className="text-sm text-gray-900">{currentUser?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">Rôle</label>
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                  {currentUser?.role === 'client' ? 'Client' : currentUser?.role === 'vendeur' ? 'Vendeur' : 'Admin'}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">Membre depuis</label>
                <p className="text-sm text-gray-900">
                  {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    if (currentUser) {
                      setProfileData({
                        email: currentUser.email,
                        first_name: currentUser.first_name,
                        last_name: currentUser.last_name,
                      })
                    }
                  }}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {/* Mot de passe Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel *</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="input"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe *</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="input"
                required
                minLength={6}
              />
            </div>
            
            <button type="submit" disabled={isSaving} className="btn btn-primary w-full">
              {isSaving ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      )}
      
      {/* Sécurité Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Sécurité du compte</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-gray-300 bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">Informations de sécurité</h3>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Votre compte est protégé par JWT</li>
                <li>• Protection rate limiting activée (5 tentatives/minute)</li>
                <li>• Mot de passe hashé avec Bcrypt</li>
              </ul>
            </div>
            
            {/* Statut du compte */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Statut du compte</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-600">État</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${currentUser?.is_active ? 'bg-gray-100 text-gray-800' : 'bg-red-50 text-red-600'}`}>
                    {currentUser?.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {currentUser?.is_blocked && (
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100 text-sm text-red-700">
                    <span className="font-medium">Compte bloqué</span>
                    <span className="text-xs">Contactez l'administrateur</span>
                  </div>
                )}
              </div>
            </div>
            <div className="border border-red-200 rounded p-4 bg-red-50">
              <h3 className="text-sm font-medium text-red-900 mb-2">Zone de danger</h3>
              <p className="text-xs text-red-800 mb-3">La désactivation est réversible. Un admin pourra réactiver le compte.</p>
              <button onClick={handleDeleteAccount} className="btn btn-danger text-xs">
                Désactiver mon compte
              </button>
            </div>
            <div className="border border-gray-200 rounded p-4 bg-white">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Support multicanal (tickets)</h3>
              <form onSubmit={handleCreateTicket} className="grid md:grid-cols-2 gap-2 mb-3">
                <select className="input" value={ticketForm.channel} onChange={(e) => setTicketForm((p) => ({ ...p, channel: e.target.value }))}>
                  <option value="web">Web</option>
                  <option value="email">Email</option>
                  <option value="phone">Téléphone</option>
                </select>
                <select className="input" value={ticketForm.priority} onChange={(e) => setTicketForm((p) => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                </select>
                <input className="input md:col-span-2" placeholder="Sujet" value={ticketForm.subject} onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))} required />
                <textarea className="input md:col-span-2" rows={3} placeholder="Message" value={ticketForm.message} onChange={(e) => setTicketForm((p) => ({ ...p, message: e.target.value }))} required />
                <button className="btn btn-primary md:col-span-2" type="submit">Créer un ticket</button>
              </form>
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="border border-gray-100 rounded p-3 text-xs">
                    <p className="text-gray-800 font-medium">#{t.id} - {t.subject}</p>
                    <p className="text-gray-600">Canal: {t.channel} | Priorité: {t.priority} | Statut: {t.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPage
