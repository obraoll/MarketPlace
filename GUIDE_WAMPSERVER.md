# 🟢 Guide Configuration MySQL avec WampServer

Votre WampServer est installé dans **`C:\wamp64`** avec MySQL 9.1.0.

---

## ✅ Configuration en 3 Étapes

### 1️⃣ Démarrer WampServer

**Avant de commencer, vérifiez que WampServer fonctionne :**

1. Cliquez sur l'**icône WampServer** dans la barre des tâches (près de l'horloge)
2. L'icône doit être **VERTE** 🟢
   - 🟢 **Vert** = Tout fonctionne parfaitement
   - 🟠 **Orange** = Certains services ne fonctionnent pas
   - 🔴 **Rouge** = WampServer ne fonctionne pas

**Si l'icône n'est pas verte :**
- Clic gauche sur l'icône WampServer
- Cliquez sur **"Start All Services"**
- Ou cliquez sur **MySQL** → **Service** → **Start/Resume Service**

---

### 2️⃣ Configurer la Base de Données

**Ouvrez PowerShell et exécutez :**

```powershell
cd C:\Users\smith\marketplace\backend
cmd /c setup_mysql_wamp.bat
```

**Le script va vous demander :**

1. **"WampServer est-il lancé ?"**
   - Vérifiez que l'icône est verte
   - Tapez **O** et appuyez sur Entrée

2. **"Entrez le mot de passe root de MySQL"**
   - Par défaut, WampServer n'a **PAS de mot de passe**
   - **Appuyez juste sur Entrée** (laissez vide)

Le script va :
- ✅ Créer la base de données `marketplace_db`
- ✅ Créer l'utilisateur `marketplace_user`
- ✅ Installer les dépendances Python
- ✅ Créer les tables
- ✅ Ajouter les données de test

---

### 3️⃣ Lancer l'Application

Une fois la configuration terminée :

**Terminal 1 - Backend :**
```powershell
cd C:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend :**
```powershell
cd C:\Users\smith\marketplace\frontend
npm install  # Si pas déjà fait
npm run dev
```

---

## 🌐 Accès

| Service | URL |
|---------|-----|
| 🎨 **Application** | http://localhost:5173 |
| 🔧 **API** | http://localhost:8000 |
| 📚 **Documentation API** | http://localhost:8000/docs |
| 💾 **phpMyAdmin** | http://localhost/phpmyadmin |

---

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👨‍💼 Admin | admin@marketplace.com | admin123 |
| 🛒 Vendeur | vendeur@marketplace.com | vendeur123 |
| 👤 Client | client@marketplace.com | client123 |

---

## 🎯 Commande Unique (Tout en Un)

Si vous voulez tout faire en une seule commande depuis PowerShell :

```powershell
cd C:\Users\smith\marketplace\backend; cmd /c setup_mysql_wamp.bat
```

---

## 🐛 Problèmes Courants

### ❌ "Can't connect to MySQL server"

**Cause :** WampServer n'est pas lancé ou MySQL n'est pas démarré

**Solution :**
1. Cliquez sur l'icône WampServer
2. Vérifiez que l'icône est verte
3. Si elle est orange/rouge : **Start All Services**

---

### ❌ "Access denied for user 'root'"

**Cause :** Vous avez entré un mot de passe mais WampServer n'en a pas par défaut

**Solution :**
- Quand le script demande le mot de passe, **appuyez juste sur Entrée** sans rien taper

**Pour tester manuellement :**
```powershell
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root
```

Si ça fonctionne sans `-p`, alors il n'y a pas de mot de passe.

---

### ❌ "Unknown database 'marketplace_db'"

**Cause :** La base de données n'a pas été créée

**Solution :**
```powershell
cd C:\Users\smith\marketplace\backend
cmd /c setup_mysql_wamp.bat
```

---

## 💡 Conseils

### Utiliser phpMyAdmin (Interface Graphique)

WampServer inclut phpMyAdmin pour gérer MySQL visuellement :

1. Démarrez WampServer (icône verte)
2. Ouvrez votre navigateur
3. Allez sur : http://localhost/phpmyadmin
4. Connectez-vous :
   - **Utilisateur :** root
   - **Mot de passe :** (laissez vide)
5. Vous pouvez voir votre base `marketplace_db` et toutes les tables

### Garder WampServer Lancé

Pendant le développement, gardez WampServer actif (icône verte dans la barre des tâches).

### Démarrage Automatique

Pour que WampServer se lance automatiquement au démarrage de Windows :
1. Clic droit sur l'icône WampServer
2. **Tools** → **Start automatically with Windows**

---

## 📊 Vérifier la Configuration

### Vérifier que MySQL fonctionne

```powershell
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" --version
```

**Résultat attendu :**
```
Ver 9.1.0 for Win64 on x86_64 (MySQL Community Server - GPL)
```

### Vérifier la connexion Python

```powershell
cd C:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
python test_mysql_connection.py
```

**Résultat attendu :**
```
✅ Connexion réussie !
```

### Voir les bases de données

```powershell
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root -e "SHOW DATABASES;"
```

Vous devriez voir `marketplace_db` dans la liste.

---

## 🔄 Réinitialiser la Base de Données

Si vous voulez repartir de zéro :

```powershell
# Supprimer la base
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root -e "DROP DATABASE IF EXISTS marketplace_db; CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Recréer les tables et données
cd C:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
python init_mysql_database.py
```

---

## 🎉 Vous êtes prêt !

Votre marketplace est maintenant configurée avec WampServer !

**Prochaines étapes :**

1. ✅ Assurez-vous que WampServer est lancé (icône verte)
2. ✅ Configurez MySQL : `cmd /c setup_mysql_wamp.bat`
3. ✅ Lancez le backend : `uvicorn app.main:app --reload`
4. ✅ Lancez le frontend : `npm run dev`
5. ✅ Ouvrez http://localhost:5173

**Bon développement ! 🚀**
