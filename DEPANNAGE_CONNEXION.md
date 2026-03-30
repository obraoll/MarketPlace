# 🔧 Dépannage - "Token invalide ou expiré"

## ❓ Problème

Vous voyez ce message après avoir recréé la base de données :

```
❌ Token invalide ou expiré
```

---

## ✅ SOLUTION (1 minute)

### Vider le localStorage du navigateur

1. Allez sur **http://localhost:5173**
2. Appuyez sur **F12** (ouvre DevTools)
3. Cliquez sur **Console**
4. Tapez cette commande :

```javascript
localStorage.clear()
location.reload()
```

5. Appuyez sur **Entrée**

**✅ C'est tout ! Le problème est résolu.**

---

## 🔍 POURQUOI CE PROBLÈME ?

### Cause

Quand vous recréez la base de données avec `init_mysql_database.py` :

1. Tous les utilisateurs sont **supprimés**
2. Nouveaux utilisateurs créés avec **nouveaux IDs**
3. L'ancien token JWT dans le navigateur pointe vers **ancien user_id** qui n'existe plus
4. Backend rejette le token → "Token invalide"

### Schéma

```
localStorage → Ancien Token → {"user_id": 123 (n'existe plus)}
                               ↓
                        Backend vérifie
                               ↓
                        User 123 introuvable
                               ↓
                        ❌ Token invalide
```

---

## 💡 SOLUTIONS ALTERNATIVES

### Solution 1 : Console JavaScript (Rapide)

```javascript
localStorage.clear()
location.reload()
```

---

### Solution 2 : Application Storage

1. **F12** → Onglet **Application**
2. Menu gauche → **Local Storage** → **http://localhost:5173**
3. Clic droit sur la ligne `token` → **Delete**
4. Rechargez la page (**F5**)

---

### Solution 3 : Mode Incognito

Ouvrez une nouvelle fenêtre **Navigation privée** :
- Chrome : **Ctrl + Shift + N**
- Firefox : **Ctrl + Shift + P**
- Edge : **Ctrl + Shift + N**

Allez sur http://localhost:5173 et connectez-vous.

---

### Solution 4 : Vider tout le cache

1. **Ctrl + Shift + Delete** (Effacer les données de navigation)
2. Cochez **Cookies et données de site**
3. Période : **Dernière heure**
4. Cliquez sur **Effacer les données**

---

## 🔑 COMPTES DE TEST

Après avoir vidé le localStorage, connectez-vous avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👨‍💼 Admin | admin@marketplace.com | admin123 |
| 🛒 Vendeur | vendeur@marketplace.com | vendeur123 |
| 👤 Client | client@marketplace.com | client123 |

---

## 🧪 VÉRIFIER QUE TOUT FONCTIONNE

### 1. Tester l'API directement

**Ouvrez DevTools Console (F12) et testez :**

```javascript
// Test de connexion
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@marketplace.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Token reçu:', data))
.catch(err => console.error('❌ Erreur:', err))
```

**Résultat attendu :**
```javascript
✅ Token reçu: {access_token: "eyJ...", token_type: "bearer"}
```

---

### 2. Vérifier que le backend fonctionne

Allez sur : **http://localhost:8000/docs**

Testez l'endpoint `/auth/login` directement dans Swagger :

1. Cliquez sur **POST /api/v1/auth/login**
2. Cliquez sur **Try it out**
3. Remplissez :
   ```json
   {
     "email": "admin@marketplace.com",
     "password": "admin123"
   }
   ```
4. Cliquez sur **Execute**

**Résultat attendu :** Status **200** avec un `access_token`

---

## 🔄 SI LE PROBLÈME PERSISTE

### Vérifier les logs backend

Regardez les logs dans le terminal backend. Vous devriez voir :

```json
{"timestamp": "...", "level": "INFO", "message": "..."}
```

### Vérifier que la base de données est correcte

```powershell
cd C:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
python test_mysql_connection.py
```

**Résultat attendu :**
```
✅ Connexion réussie !
📋 Tables existantes (5)
```

### Redémarrer le backend

```powershell
# Arrêter (Ctrl+C dans le terminal backend)
# Relancer
cd backend
.\venv\Scripts\Activate.ps1
$env:PYTHONIOENCODING="utf-8"
uvicorn app.main:app --reload
```

---

## 🎯 CHECKLIST DÉPANNAGE

- [ ] localStorage.clear() exécuté
- [ ] Page rechargée (F5)
- [ ] Backend fonctionne (http://localhost:8000/docs accessible)
- [ ] Base de données connectée (test_mysql_connection.py)
- [ ] WampServer lancé (icône verte)
- [ ] Identifiants corrects utilisés

---

## 💡 ASTUCE POUR LE FUTUR

**Pour éviter ce problème lors de la prochaine recréation de base :**

Ajoutez ce code dans le frontend (`src/stores/authStore.js`) :

```javascript
logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')  // Si vous stockez le user
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  // Nouveau : Force logout si token invalide
  forceLogout: () => {
    console.warn('Token invalide détecté, déconnexion forcée')
    localStorage.clear()
    window.location.href = '/login'
  }
```

---

## ✅ EN RÉSUMÉ

**1 commande pour résoudre :**

```javascript
localStorage.clear(); location.reload()
```

**Dans la console (F12) du navigateur.**

---

## 🎉 APRÈS LA RÉSOLUTION

Une fois le localStorage vidé, vous pourrez :

- ✅ Vous connecter normalement
- ✅ Accéder aux dashboards
- ✅ Gérer les produits
- ✅ Utiliser le panier
- ✅ Passer des commandes

---

**📞 Besoin d'aide ?** Vérifiez que :
1. Backend fonctionne (http://localhost:8000/health)
2. Frontend fonctionne (http://localhost:5173)
3. localStorage vidé (console: `localStorage.clear()`)

---

**Date :** 10 Février 2026  
**Solution :** localStorage.clear() ✨
