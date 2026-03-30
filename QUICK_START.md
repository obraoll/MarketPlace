# ⚡ Quick Start - Marketplace en 5 minutes

## 🎯 Objectif

Lancer la marketplace complète en moins de 5 minutes.

## 📋 Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## 🚀 Installation rapide

### 1. Base de données (30 secondes)

```bash
# Créer la base
psql -U postgres -c "CREATE DATABASE marketplace_db;"
psql -U postgres -c "CREATE USER marketplace_user WITH PASSWORD 'password123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;"
```

### 2. Backend (2 minutes)

```bash
cd backend

# Installer
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Configurer
echo DATABASE_URL=postgresql://marketplace_user:password123@localhost:5432/marketplace_db > .env
echo SECRET_KEY=dev-secret-key-change-in-production >> .env
echo ALLOWED_ORIGINS=http://localhost:5173 >> .env

# Lancer
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
uvicorn app.main:app --reload &
```

### 3. Frontend (2 minutes)

**Nouveau terminal :**

```bash
cd frontend

# Installer et lancer
npm install
npm run dev &
```

### 4. Données de test (30 secondes)

**Nouveau terminal :**

```bash
cd cli
python marketplace_cli.py seed
```

## ✅ C'est prêt !

- 🌐 Frontend : http://localhost:5173
- 🔌 API : http://localhost:8000
- 📚 Docs : http://localhost:8000/docs

## 🔑 Se connecter

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `client@marketplace.com` | `client123` | Client |
| `vendeur@marketplace.com` | `vendeur123` | Vendeur |
| `admin@marketplace.com` | `admin123` | Admin |

## 🧪 Tester

1. Allez sur http://localhost:5173
2. Connectez-vous avec `client@marketplace.com` / `client123`
3. Parcourez les produits
4. Ajoutez au panier
5. Passez commande

## 📖 En savoir plus

- [README complet](README.md)
- [Guide de démarrage](docs/GUIDE_DEMARRAGE.md)
- [Documentation technique](docs/DOCUMENTATION_TECHNIQUE.md)

🎉 **Bon développement !**
