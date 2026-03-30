# 📜 Scripts de Configuration MySQL

Ce dossier contient plusieurs scripts pour faciliter la configuration et la gestion de MySQL.

## 🚀 Scripts Disponibles

### 1. `configure_mysql.bat` ⭐ (Principal)

**Script de configuration automatique complet**

```powershell
.\configure_mysql.bat
```

**Ce qu'il fait :**
- ✅ Vérifie que MySQL est installé
- ✅ Crée la base de données `marketplace_db`
- ✅ Crée l'utilisateur `marketplace_user`
- ✅ Teste la connexion
- ✅ Crée toutes les tables
- ✅ Ajoute les données de test

**Quand l'utiliser :** Lors de la première installation

---

### 2. `test_mysql_connection.py`

**Test de connexion à MySQL**

```powershell
venv\Scripts\activate
python test_mysql_connection.py
```

**Ce qu'il fait :**
- 🔍 Vérifie la connexion à MySQL
- 📊 Affiche la version de MySQL
- 📂 Affiche le nom de la base de données
- 📋 Liste les tables existantes

**Quand l'utiliser :** Pour diagnostiquer les problèmes de connexion

---

### 3. `init_mysql_database.py`

**Initialisation de la base de données**

```powershell
venv\Scripts\activate
python init_mysql_database.py
```

**Ce qu'il fait :**
- 🔨 Crée toutes les tables (users, products, orders, etc.)
- 🌱 Ajoute des données de test :
  - 3 utilisateurs (admin, vendeur, client)
  - 5 produits reconditionnés

**Quand l'utiliser :**
- Après avoir créé la base de données
- Pour réinitialiser les données de test

---

### 4. `setup_mysql.sql`

**Script SQL de configuration**

```bash
mysql -u root -p < setup_mysql.sql
```

**Ce qu'il fait :**
- 🗄️ Crée la base de données `marketplace_db`
- 👤 Crée l'utilisateur `marketplace_user`
- 🔐 Accorde les privilèges nécessaires

**Quand l'utiliser :** Configuration manuelle de MySQL

---

## 📋 Ordre d'Exécution

### Installation Complète (Recommandé)

```powershell
# Étape unique - tout en un
.\configure_mysql.bat
```

### Installation Manuelle (Étape par étape)

```powershell
# 1. Créer la base de données
mysql -u root -p < setup_mysql.sql

# 2. Créer l'environnement virtuel
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. Vérifier la connexion
python test_mysql_connection.py

# 4. Créer les tables et données
python init_mysql_database.py
```

---

## 🔧 Configuration du Fichier .env

Le fichier `.env` doit contenir :

```env
# Database MySQL
DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db

# JWT
SECRET_KEY=dev-secret-key-change-in-production-use-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Provider (optionnel)
AI_PROVIDER=openai
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

---

## 🎯 Cas d'Usage Courants

### Réinitialiser la Base de Données

```sql
# Supprimer toutes les données
mysql -u root -p -e "DROP DATABASE marketplace_db; CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Recréer les tables et données
python init_mysql_database.py
```

### Vérifier l'État de la Base

```powershell
python test_mysql_connection.py
```

### Ajouter de Nouvelles Données de Test

```powershell
# Si vous avez supprimé les utilisateurs de test
python init_mysql_database.py
```

### Modifier le Mot de Passe MySQL

```sql
mysql -u root -p
ALTER USER 'marketplace_user'@'localhost' IDENTIFIED BY 'nouveau_password';
FLUSH PRIVILEGES;
```

Puis mettez à jour `DATABASE_URL` dans `.env`

---

## 🐛 Dépannage

### Problème : "Access denied"

```sql
mysql -u root -p
DROP USER IF EXISTS 'marketplace_user'@'localhost';
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
```

### Problème : "Can't connect to MySQL"

**Vérifier que MySQL fonctionne :**
```powershell
# Windows Services
services.msc
# Chercher MySQL et démarrer si nécessaire
```

### Problème : "Unknown database"

```sql
mysql -u root -p
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Problème : "No module named 'pymysql'"

```powershell
venv\Scripts\activate
pip install pymysql cryptography
```

---

## 📊 Structure des Tables

Après l'exécution de `init_mysql_database.py`, vous aurez :

### Table `users`
- Utilisateurs (clients, vendeurs, admins)
- Champs : id, email, password, role, etc.

### Table `products`
- Produits reconditionnés
- Champs : id, name, brand, category, condition, price, stock, etc.

### Table `orders`
- Commandes des clients
- Champs : id, order_number, status, total_amount, etc.

### Table `order_items`
- Détails des commandes (produits commandés)
- Champs : id, order_id, product_id, quantity, unit_price

### Table `cart_items`
- Paniers d'achat des utilisateurs
- Champs : id, user_id, product_id, quantity

---

## 🎉 Après la Configuration

Une fois MySQL configuré avec succès :

### Lancer le Backend

```powershell
cd C:\Users\smith\marketplace\backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

✅ API disponible sur http://localhost:8000
📚 Documentation API : http://localhost:8000/docs

### Lancer le Frontend

```powershell
cd C:\Users\smith\marketplace\frontend
npm install
npm run dev
```

✅ Application disponible sur http://localhost:5173

### Ou les deux en même temps

```powershell
cd C:\Users\smith\marketplace
.\start_marketplace.bat
```

---

## 📚 Documentation Complémentaire

- 📄 [CONFIGURATION_MYSQL_RAPIDE.md](../CONFIGURATION_MYSQL_RAPIDE.md) - Guide rapide
- 📄 [INSTALLATION_MYSQL.md](../INSTALLATION_MYSQL.md) - Guide complet
- 📄 [QUICK_START.md](../QUICK_START.md) - Démarrage rapide

---

**Besoin d'aide ?** Consultez les guides dans le dossier principal ou la documentation MySQL officielle.
