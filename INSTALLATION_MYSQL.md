# 🐬 Installation avec MySQL

Ce guide vous explique comment configurer le projet Marketplace avec MySQL.

## 📋 Prérequis

- Python 3.11+
- Node.js 18+
- **MySQL 8.0+** ou MariaDB 10.6+

## 🚀 Installation rapide

### 1. Créer la base de données MySQL

**Option A : Ligne de commande MySQL**

```bash
# Se connecter à MySQL
mysql -u root -p

# Dans MySQL, exécutez :
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option B : Via phpMyAdmin ou MySQL Workbench**

1. Créer une base de données : `marketplace_db`
2. Créer un utilisateur : `marketplace_user` avec mot de passe : `password123`
3. Donner tous les privilèges sur `marketplace_db` à `marketplace_user`

### 2. Installation du Backend

```powershell
cd C:\Users\smith\marketplace\backend

# Créer l'environnement virtuel
python -m venv venv
venv\Scripts\activate

# Installer les dépendances MySQL
pip install -r requirements.txt

# Configurer les variables d'environnement
copy .env.example .env
```

**Éditer le fichier `.env`** :

```env
# Database MySQL
DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db

# JWT
SECRET_KEY=votre-cle-secrete-super-longue-changez-moi-en-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys (optionnel pour l'IA)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_API_KEY=AIzxxx
AI_PROVIDER=openai

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Créer les tables** :

```powershell
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

**Lancer le backend** :

```powershell
uvicorn app.main:app --reload
```

✅ Backend disponible sur http://localhost:8000

### 3. Installation du Frontend

**Nouveau terminal PowerShell** :

```powershell
cd C:\Users\smith\marketplace\frontend

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

✅ Frontend disponible sur http://localhost:5173

### 4. Ajouter des données de test

**Nouveau terminal PowerShell** :

```powershell
cd C:\Users\smith\marketplace\cli
python marketplace_cli.py seed
```

## 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | client@marketplace.com | client123 |
| Vendeur | vendeur@marketplace.com | vendeur123 |
| Admin | admin@marketplace.com | admin123 |

## ⚙️ Configuration MySQL avancée

### Format de la DATABASE_URL

```
mysql+pymysql://utilisateur:motdepasse@host:port/nom_base
```

**Exemples** :

```env
# Local
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/marketplace_db

# Avec IP
DATABASE_URL=mysql+pymysql://user:pass@192.168.1.100:3306/marketplace_db

# XAMPP
DATABASE_URL=mysql+pymysql://root:@localhost:3306/marketplace_db

# MariaDB
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/marketplace_db

# MySQL distant
DATABASE_URL=mysql+pymysql://user:pass@db.example.com:3306/marketplace_db
```

### Problèmes courants

#### 1. Erreur "Access denied for user"

```bash
# Vérifier les privilèges
mysql -u root -p
SHOW GRANTS FOR 'marketplace_user'@'localhost';

# Recréer l'utilisateur si nécessaire
DROP USER 'marketplace_user'@'localhost';
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Erreur "Can't connect to MySQL server"

- Vérifier que MySQL est lancé
- Vérifier le port (3306 par défaut)
- Vérifier le firewall

**Windows** : Services → MySQL → Démarrer

**XAMPP** : Panneau XAMPP → MySQL → Start

#### 3. Erreur "Unknown database"

```bash
mysql -u root -p
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. Erreur "No module named 'pymysql'"

```powershell
pip install pymysql cryptography
```

## 🐳 Utilisation avec Docker MySQL

Si vous utilisez MySQL via Docker :

```bash
docker run --name mysql-marketplace \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=marketplace_db \
  -e MYSQL_USER=marketplace_user \
  -e MYSQL_PASSWORD=password123 \
  -p 3306:3306 \
  -d mysql:8.0
```

DATABASE_URL :
```env
DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db
```

## 📊 Vérifier la connexion

**Test rapide** :

```powershell
cd backend
venv\Scripts\activate
python -c "from app.core.database import engine; print('✅ Connexion MySQL OK' if engine.connect() else '❌ Erreur')"
```

## 🔄 Migration PostgreSQL → MySQL

Si vous aviez déjà des données avec PostgreSQL :

1. Exporter les données de PostgreSQL
2. Adapter les types de données si nécessaire
3. Importer dans MySQL

**Note** : SQLAlchemy gère la compatibilité automatiquement pour les types de base.

## 📚 Ressources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PyMySQL Documentation](https://pymysql.readthedocs.io/)
- [SQLAlchemy MySQL Dialect](https://docs.sqlalchemy.org/en/20/dialects/mysql.html)

## ✅ Checklist d'installation

- [ ] MySQL installé et lancé
- [ ] Base de données `marketplace_db` créée
- [ ] Utilisateur `marketplace_user` créé avec privilèges
- [ ] Backend : `pip install -r requirements.txt`
- [ ] Backend : `.env` configuré avec DATABASE_URL MySQL
- [ ] Backend : Tables créées
- [ ] Backend : Serveur lancé (port 8000)
- [ ] Frontend : `npm install`
- [ ] Frontend : Serveur lancé (port 5173)
- [ ] CLI : Données de test ajoutées (`seed`)

---

🎉 **Votre marketplace est maintenant configurée avec MySQL !**

Accès :
- Frontend : http://localhost:5173
- API : http://localhost:8000
- Docs : http://localhost:8000/docs
