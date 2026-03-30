# 🚀 Guide d'Installation - Marketplace MySQL

## ⚡ Installation Ultra-Rapide (1 commande)

Depuis la racine du projet, exécutez :

```powershell
.\INSTALLER_TOUT.bat
```

**Ce script fait TOUT automatiquement :**
- ✅ Détecte MySQL (même s'il n'est pas dans le PATH)
- ✅ Configure la base de données
- ✅ Installe toutes les dépendances
- ✅ Crée les tables et données de test
- ✅ Lance l'application (optionnel)

---

## 🔧 Installation Par Composant

### Si vous avez l'erreur "mysql n'est pas reconnu"

Utilisez l'un de ces scripts :

```powershell
cd backend

# Option 1 : Script Batch (Recommandé)
.\setup_mysql_sans_path.bat

# Option 2 : Script PowerShell
.\Setup-MySQL.ps1

# Option 3 : Vérifier où est MySQL
.\verifier_mysql.bat
```

### Si MySQL est déjà dans le PATH

```powershell
cd backend
.\configure_mysql.bat
```

---

## 📋 Structure des Scripts Disponibles

### Scripts d'Installation Complète

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `INSTALLER_TOUT.bat` | ⭐ **Installation complète automatique** | Racine du projet |
| `start_marketplace.bat` | Lance backend + frontend | Après installation |

### Scripts de Configuration MySQL

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `backend/setup_mysql_sans_path.bat` | ⭐ **Configuration MySQL auto-détectée** | MySQL pas dans PATH |
| `backend/Setup-MySQL.ps1` | Version PowerShell du script ci-dessus | MySQL pas dans PATH |
| `backend/configure_mysql.bat` | Configuration standard | MySQL dans PATH |
| `backend/verifier_mysql.bat` | Trouve MySQL sur votre PC | Diagnostic |

### Scripts de Test et Initialisation

| Script | Description | Utilisation |
|--------|-------------|-------------|
| `backend/test_mysql_connection.py` | Test de connexion MySQL | Après config |
| `backend/init_mysql_database.py` | Crée tables et données | Après config |
| `backend/setup_mysql.sql` | Script SQL direct | Configuration manuelle |

---

## 📚 Documentation Disponible

### Guides Rapides

- **`backend/LIRE_MOI_EN_PREMIER.txt`** ⭐ - À lire en cas d'erreur
- **`backend/AIDE_RAPIDE.md`** - Solutions rapides

### Guides Détaillés

- **`CONFIGURATION_MYSQL_RAPIDE.md`** - Guide de configuration étape par étape
- **`MYSQL_CONFIGURATION_COMPLETE.md`** - Récapitulatif complet de la configuration
- **`backend/SOLUTION_MYSQL_PATH.md`** - Résolution du problème "mysql n'est pas reconnu"
- **`INSTALLATION_MYSQL.md`** - Guide d'installation détaillé

### Documentation Technique

- **`backend/README_SCRIPTS.md`** - Documentation de tous les scripts
- **`PROJECT_STRUCTURE.md`** - Structure du projet
- **`docs/DOCUMENTATION_TECHNIQUE.md`** - Documentation technique complète

---

## 🎯 Workflows d'Installation

### Workflow 1 : Installation Automatique Totale (Recommandé)

```powershell
# Depuis la racine du projet
.\INSTALLER_TOUT.bat
```

✅ **Avantages :**
- Une seule commande
- Détection automatique de MySQL
- Installation complète
- Peut lancer l'application directement

---

### Workflow 2 : Installation MySQL Uniquement

```powershell
# Depuis backend/
.\setup_mysql_sans_path.bat

# Puis lancer l'application
cd ..
.\start_marketplace.bat
```

✅ **Avantages :**
- Focus sur MySQL
- Détection automatique
- Idéal si Node.js déjà configuré

---

### Workflow 3 : Installation Manuelle (Contrôle Total)

```powershell
# 1. Trouver MySQL
cd backend
.\verifier_mysql.bat

# 2. Créer la base de données
# (Utiliser le chemin donné par le script ci-dessus)
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

# Dans MySQL :
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 3. Configuration Python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 4. Initialiser la base
python init_mysql_database.py

# 5. Lancer le backend
uvicorn app.main:app --reload

# 6. Lancer le frontend (nouveau terminal)
cd ..\frontend
npm install
npm run dev
```

✅ **Avantages :**
- Contrôle total sur chaque étape
- Idéal pour comprendre le processus
- Bon pour le débogage

---

## 🆘 Résolution de Problèmes

### ❌ Erreur : "mysql n'est pas reconnu"

**Solution immédiate :**
```powershell
cd backend
.\setup_mysql_sans_path.bat
```

**Documentation :** `backend/SOLUTION_MYSQL_PATH.md`

---

### ❌ Erreur : "Access denied for user 'root'"

**Pour XAMPP (pas de mot de passe par défaut) :**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root
```

**Pour MySQL standard :**
- Utilisez le mot de passe défini lors de l'installation
- Ou réinitialisez le mot de passe root

---

### ❌ Erreur : "Can't connect to MySQL server"

**Vérifier que MySQL fonctionne :**

1. **Windows Services :**
   - `Win + R` → `services.msc`
   - Chercher "MySQL" → Clic droit → Démarrer

2. **XAMPP :**
   - Ouvrir le panneau XAMPP
   - Cliquer "Start" sur MySQL

3. **WAMP :**
   - Cliquer sur l'icône WAMP
   - MySQL → Start

---

### ❌ MySQL n'est pas installé

**Options d'installation :**

1. **MySQL Community Server (Officiel)**
   - https://dev.mysql.com/downloads/installer/
   - Cochez "Add to PATH" pendant l'installation

2. **XAMPP (Recommandé pour débuter)**
   - https://www.apachefriends.org/
   - Inclut MySQL + phpMyAdmin
   - Très simple à utiliser

3. **Docker**
   ```powershell
   docker run --name mysql-marketplace `
     -e MYSQL_ROOT_PASSWORD=rootpassword `
     -e MYSQL_DATABASE=marketplace_db `
     -e MYSQL_USER=marketplace_user `
     -e MYSQL_PASSWORD=password123 `
     -p 3306:3306 `
     -d mysql:8.0
   ```

---

## 🎯 Après l'Installation

### Vérifier que tout fonctionne

```powershell
cd backend
venv\Scripts\activate
python test_mysql_connection.py
```

**Résultat attendu :** `✅ Connexion réussie !`

---

### Lancer l'Application

**Option A : Script automatique**
```powershell
.\start_marketplace.bat
```

**Option B : Manuel (2 terminaux)**

Terminal 1 - Backend :
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Terminal 2 - Frontend :
```powershell
cd frontend
npm run dev
```

---

### Accéder à l'Application

| Service | URL |
|---------|-----|
| 🌐 **Application Web** | http://localhost:5173 |
| 🔧 **API REST** | http://localhost:8000 |
| 📚 **Documentation API** | http://localhost:8000/docs |

---

### Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👨‍💼 **Admin** | admin@marketplace.com | admin123 |
| 🛒 **Vendeur** | vendeur@marketplace.com | vendeur123 |
| 👤 **Client** | client@marketplace.com | client123 |

---

## 📊 Ce qui est Inclus Après Installation

### Base de Données

- **marketplace_db** - Base de données MySQL
- **5 tables** : users, products, orders, order_items, cart_items

### Données de Test

- **3 utilisateurs** : 1 admin, 1 vendeur, 1 client
- **5 produits** : iPhone 12 Pro, MacBook Pro 13, iPad Air, Galaxy S21, AirPods Pro

### Backend (Python/FastAPI)

- ✅ API REST complète
- ✅ Authentication JWT
- ✅ CRUD utilisateurs, produits, commandes
- ✅ Gestion du panier
- ✅ Service d'IA (optionnel)

### Frontend (React/Vite)

- ✅ Interface moderne et responsive
- ✅ Authentification utilisateur
- ✅ Catalogue de produits
- ✅ Panier d'achat
- ✅ Gestion des commandes
- ✅ Dashboards admin et vendeur

---

## 🔄 Réinitialiser l'Installation

### Réinitialiser uniquement la base de données

```sql
mysql -u root -p -e "DROP DATABASE marketplace_db; CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Puis :
```powershell
cd backend
venv\Scripts\activate
python init_mysql_database.py
```

### Réinitialisation complète

```powershell
# Supprimer les environnements
Remove-Item -Recurse -Force backend\venv
Remove-Item -Recurse -Force frontend\node_modules

# Réinstaller
.\INSTALLER_TOUT.bat
```

---

## 📝 Checklist Complète

- [ ] MySQL 8.0+ installé
- [ ] Python 3.11+ installé
- [ ] Node.js 18+ installé
- [ ] Base de données créée (`marketplace_db`)
- [ ] Utilisateur MySQL créé (`marketplace_user`)
- [ ] Backend : environnement virtuel créé
- [ ] Backend : dépendances installées
- [ ] Backend : fichier `.env` configuré
- [ ] Backend : tables créées
- [ ] Backend : données de test ajoutées
- [ ] Frontend : dépendances installées
- [ ] Test : connexion MySQL réussie
- [ ] Test : backend accessible (http://localhost:8000)
- [ ] Test : frontend accessible (http://localhost:5173)
- [ ] Test : connexion avec un compte de test

---

## 🎓 Ressources et Liens Utiles

### MySQL
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [PyMySQL Documentation](https://pymysql.readthedocs.io/)
- [Télécharger MySQL](https://dev.mysql.com/downloads/installer/)
- [Télécharger XAMPP](https://www.apachefriends.org/)

### Python/FastAPI
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

### React/Frontend
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 💡 Conseils

1. **Utilisez `INSTALLER_TOUT.bat` pour la première installation** - C'est le plus simple !
2. **Consultez `backend/LIRE_MOI_EN_PREMIER.txt`** en cas de problème
3. **Utilisez `verifier_mysql.bat`** pour diagnostiquer les problèmes MySQL
4. **Gardez MySQL en cours d'exécution** pendant le développement
5. **Utilisez les comptes de test** pour explorer l'application
6. **Consultez `/docs` sur l'API** pour voir toutes les routes disponibles

---

## 🎉 Félicitations !

Vous avez maintenant une marketplace complète avec MySQL configurée et prête à l'emploi !

**Prochaines étapes suggérées :**
1. Explorez l'interface utilisateur
2. Testez les différents rôles (admin, vendeur, client)
3. Consultez la documentation API
4. Personnalisez les produits et catégories
5. Développez de nouvelles fonctionnalités !

**Bon développement ! 🚀**
