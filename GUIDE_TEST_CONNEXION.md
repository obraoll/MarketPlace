# 🧪 Guide de Test - Connexion et Inscription

**Version :** 1.1 (avec corrections)  
**Date :** 10 Février 2026

---

## ✅ CORRECTIONS APPLIQUÉES

Les problèmes de connexion ont été corrigés :

1. ✅ Erreur réinitialisée après succès
2. ✅ Redirection automatique après connexion
3. ✅ Redirection automatique après inscription (1.5s)
4. ✅ Message de succès après inscription
5. ✅ localStorage nettoyé en cas d'erreur

---

## 🎯 TEST COMPLET - SCÉNARIO 1 : Inscription

### Étape 1 : Vider le localStorage

**Dans le navigateur (F12 → Console) :**
```javascript
localStorage.clear()
location.reload()
```

### Étape 2 : Aller sur l'inscription

URL : **http://localhost:5173/register**

### Étape 3 : Remplir le formulaire

- **Prénom :** Jean
- **Nom :** Dupont
- **Email :** jean.dupont@example.com
- **Mot de passe :** test123456
- **Type de compte :** Client

### Étape 4 : Cliquer sur "S'inscrire"

**Résultat attendu :**
```
✅ Inscription réussie ! Redirection vers la page de connexion...
```

Puis après 1.5 secondes → **Redirection automatique vers /login** ✨

---

## 🎯 TEST COMPLET - SCÉNARIO 2 : Connexion

### Étape 1 : Sur la page de connexion

URL : **http://localhost:5173/login**

### Étape 2 : Utiliser un compte de test

**Admin :**
- Email : admin@marketplace.com
- Mot de passe : admin123

**OU le compte créé :**
- Email : jean.dupont@example.com
- Mot de passe : test123456

### Étape 3 : Cliquer sur "Se connecter"

**Résultat attendu :**

1. ✅ Connexion réussie
2. ✅ **Redirection automatique vers la page d'accueil** `/`
3. ✅ Navbar affiche le nom de l'utilisateur
4. ✅ Pas de message d'erreur

---

## 🎯 TEST COMPLET - SCÉNARIO 3 : Erreurs

### Test 1 : Mauvais mot de passe

1. Email : admin@marketplace.com
2. Mot de passe : MAUVAIS_MOT_DE_PASSE
3. Cliquer sur "Se connecter"

**Résultat attendu :**
```
❌ Email ou mot de passe incorrect
```

### Test 2 : Email inexistant

1. Email : inexistant@example.com
2. Mot de passe : test123
3. Cliquer sur "Se connecter"

**Résultat attendu :**
```
❌ Email ou mot de passe incorrect
```

### Test 3 : Email déjà utilisé (inscription)

1. Aller sur /register
2. Utiliser : admin@marketplace.com
3. Cliquer sur "S'inscrire"

**Résultat attendu :**
```
❌ Cet email est déjà utilisé
```

---

## 🎯 TEST COMPLET - SCÉNARIO 4 : Protection

### Test : Accès sans connexion

1. **Videz le localStorage** : `localStorage.clear()`
2. Essayez d'accéder à : **http://localhost:5173/cart**

**Résultat attendu :**
- ✅ Redirection automatique vers `/login`

---

## 🔒 TEST RATE LIMITING

### Test : Protection brute-force

1. Essayez de vous connecter **6 fois rapidement** avec un mauvais mot de passe
2. À la **6ème tentative**, vous devriez voir :

```
❌ Rate limit exceeded (ou erreur 429)
```

**Protection activée :** ✅ Max 5 tentatives par minute

---

## 🎊 TEST COMPLET - SCÉNARIO 5 : Workflow Complet

### Parcours Utilisateur Complet

1. **Inscription**
   - /register → Remplir formulaire
   - Message succès
   - Redirection auto vers /login ✅

2. **Connexion**
   - /login → Entrer identifiants
   - Redirection auto vers / ✅

3. **Navigation**
   - Page d'accueil affichée
   - Navbar avec nom utilisateur
   - Menu accessible

4. **Produits**
   - Aller sur /products
   - Liste des produits affichée
   - Filtres fonctionnent

5. **Panier**
   - Ajouter au panier
   - Voir le panier
   - Modifier quantités

6. **Déconnexion**
   - Cliquer sur "Déconnexion"
   - Redirection vers /login
   - Plus de token dans localStorage

---

## 🐛 DÉPANNAGE

### Problème : "Token invalide ou expiré" persiste

**Solutions :**

1. **Vider localStorage** (F12 Console) :
   ```javascript
   localStorage.clear()
   location.reload()
   ```

2. **Mode Incognito** :
   - Ctrl + Shift + N
   - Tester dans une nouvelle fenêtre privée

3. **Vérifier backend** :
   - http://localhost:8000/health doit retourner `{"status": "healthy"}`
   - http://localhost:8000/docs doit être accessible

4. **Vérifier base de données** :
   ```powershell
   cd backend
   python test_mysql_connection.py
   ```

---

### Problème : Redirection ne fonctionne pas

**Vérification :**

1. Ouvrir **DevTools Console** (F12)
2. Regarder les erreurs JavaScript
3. Vérifier que React Router fonctionne

**Solution :**
```bash
cd frontend
npm install react-router-dom
```

---

### Problème : Rate limiting bloque trop rapidement

**Normal !** Protection anti brute-force :
- Max **5 tentatives par minute**
- Attendez 1 minute ou redémarrez le backend

---

## 📊 CHECKLIST VALIDATION

- [ ] localStorage vidé
- [ ] Backend fonctionne (http://localhost:8000)
- [ ] Frontend fonctionne (http://localhost:5173)
- [ ] Inscription → succès → redirection /login ✅
- [ ] Connexion → succès → redirection / ✅
- [ ] Erreur disparaît après succès ✅
- [ ] Message succès après inscription ✅
- [ ] Rate limiting actif (6ème tentative bloquée) ✅

---

## 🎉 RÉSULTAT ATTENDU

### Inscription Réussie

```
✅ Inscription réussie ! Redirection vers la page de connexion...
(Redirection automatique après 1.5 secondes)
```

### Connexion Réussie

```
(Pas de message, redirection immédiate vers /)
→ Page d'accueil avec nom utilisateur dans la navbar
```

### Erreur de Connexion

```
❌ Email ou mot de passe incorrect
(Reste sur la page /login)
```

---

## 💡 CONSEIL

**Après chaque recréation de base de données :**

Videz le localStorage du navigateur :
```javascript
localStorage.clear()
```

Ou ajoutez un bouton "Effacer le cache" dans votre application.

---

## 🚀 TESTER MAINTENANT

1. **Videz le localStorage** (F12 Console)
   ```javascript
   localStorage.clear()
   location.reload()
   ```

2. **Inscrivez-vous** sur /register
   - Vous devez voir le message de succès
   - Redirection auto vers /login

3. **Connectez-vous**
   - Redirection auto vers /

**✅ Tout devrait fonctionner parfaitement !**

---

**Date :** 10 Février 2026  
**Status :** Corrections appliquées ✅
