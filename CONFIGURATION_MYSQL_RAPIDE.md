# 🐬 Configuration MySQL - Guide Rapide

Ce guide vous aide à configurer MySQL pour votre marketplace en 5 minutes.

## 📋 Prérequis

- ✅ Python 3.11+ installé
- ✅ MySQL 8.0+ ou MariaDB 10.6+ installé
- ✅ Node.js 18+ (pour le frontend)

## 🚀 Installation Automatique (Recommandé)

### Option 1 : Script automatique complet

```powershell
cd C:\Users\smith\marketplace\backend
.\configure_mysql.bat
```

Ce script va :
1. ✅ Vérifier que MySQL est installé
2. ✅ Créer la base de données `marketplace_db`
3. ✅ Créer l'utilisateur `marketplace_user`
4. ✅ Tester la connexion
5. ✅ Créer toutes les tables
6. ✅ Ajouter des données de test

**C'est tout ! Votre marketplace est prête.**

---

## 🔧 Installation Manuelle (Étape par étape)

Si vous préférez faire les étapes une par une :

### 1️⃣ Créer la base de données MySQL

**Via ligne de commande :**

```bash
mysql -u root -p < backend\setup_mysql.sql
```

**Ou manuellement dans MySQL :**

```sql
mysql -u root -p

CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2️⃣ Configurer l'environnement Python

```powershell
cd backend

# Créer l'environnement virtuel
python -m venv venv
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### 3️⃣ Tester la connexion MySQL

```powershell
python test_mysql_connection.py
```

Vous devriez voir : `✅ Connexion réussie !`

### 4️⃣ Créer les tables et données de test

```powershell
python init_mysql_database.py
```

Cela va :
- Créer toutes les tables nécessaires
- Ajouter 3 utilisateurs de test
- Ajouter 5 produits de test

---

## 🎯 Lancement de l'Application

### Backend (API)

```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

✅ API disponible sur : **http://localhost:8000**
📚 Documentation : **http://localhost:8000/docs**

### Frontend

**Ouvrir un nouveau terminal :**

```powershell
cd frontend
npm install
npm run dev
```

✅ Application disponible sur : **http://localhost:5173**

---

## 🔑 Comptes de Test

Après l'initialisation, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👤 Client | client@marketplace.com | client123 |
| 🛒 Vendeur | vendeur@marketplace.com | vendeur123 |
| 👨‍💼 Admin | admin@marketplace.com | admin123 |

---

## ⚙️ Configuration Avancée

### Modifier la connexion MySQL

Éditez le fichier `backend\.env` :

```env
# Connexion MySQL locale
DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db

# Connexion MySQL distante
DATABASE_URL=mysql+pymysql://user:pass@192.168.1.100:3306/marketplace_db

# XAMPP (pas de mot de passe root par défaut)
DATABASE_URL=mysql+pymysql://root:@localhost:3306/marketplace_db
```

### Changer le mot de passe MySQL

```sql
mysql -u root -p
ALTER USER 'marketplace_user'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
```

Puis mettez à jour `backend\.env` avec le nouveau mot de passe.

---

## 🔍 Vérifications et Diagnostics

### Vérifier que MySQL fonctionne

**Windows Services :**
1. Appuyez sur `Win + R`
2. Tapez `services.msc`
3. Cherchez "MySQL" ou "MySQL80"
4. Vérifiez qu'il est "En cours d'exécution"

**Ligne de commande :**

```powershell
mysql -u root -p -e "SELECT VERSION();"
```

### Vérifier les tables créées

```sql
mysql -u marketplace_user -p marketplace_db

SHOW TABLES;
DESCRIBE users;
DESCRIBE products;
```

### Réinitialiser la base de données

```sql
mysql -u root -p

DROP DATABASE marketplace_db;
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Puis relancez :

```powershell
python init_mysql_database.py
```

---

## ❓ Problèmes Courants

### ❌ "Access denied for user"

**Cause :** Mauvais mot de passe ou privilèges insuffisants

**Solution :**
```sql
mysql -u root -p
DROP USER IF EXISTS 'marketplace_user'@'localhost';
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
```

### ❌ "Can't connect to MySQL server"

**Cause :** MySQL n'est pas lancé

**Solution Windows :**
- Services → MySQL → Démarrer
- Ou avec XAMPP : Panneau XAMPP → MySQL → Start

### ❌ "No module named 'pymysql'"

**Cause :** Dépendances Python non installées

**Solution :**
```powershell
pip install pymysql cryptography
```

### ❌ "Unknown database 'marketplace_db'"

**Cause :** La base de données n'existe pas

**Solution :**
```sql
mysql -u root -p
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🐳 Alternative : Docker MySQL

Si vous préférez utiliser Docker :

```bash
docker run --name mysql-marketplace \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=marketplace_db \
  -e MYSQL_USER=marketplace_user \
  -e MYSQL_PASSWORD=password123 \
  -p 3306:3306 \
  -d mysql:8.0
```

La configuration dans `.env` reste la même :

```env
DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db
```

---

## 📊 Structure de la Base de Données

Après initialisation, vous aurez ces tables :

- **users** - Utilisateurs (clients, vendeurs, admins)
- **products** - Produits reconditionnés
- **orders** - Commandes
- **order_items** - Détails des commandes
- **cart_items** - Paniers d'achat

---

## 🎉 Vous êtes prêt !

Votre marketplace avec MySQL est maintenant configurée et prête à l'emploi.

**Prochaines étapes :**

1. Lancez le backend : `uvicorn app.main:app --reload`
2. Lancez le frontend : `npm run dev`
3. Ouvrez http://localhost:5173
4. Connectez-vous avec un compte de test
5. Explorez l'application !

---

## 📚 Ressources Supplémentaires

- 📄 [INSTALLATION_MYSQL.md](./INSTALLATION_MYSQL.md) - Guide détaillé
- 📄 [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- 🌐 [MySQL Documentation](https://dev.mysql.com/doc/)
- 🐍 [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

**Besoin d'aide ?** Consultez la documentation complète dans le dossier `docs/`.
