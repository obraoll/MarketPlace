# 🛒 Marketplace Reconditionné

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)

Plateforme e-commerce de type marketplace pour produits reconditionnés, inspirée de Back Market.

## 📋 Description

Ce projet est une marketplace multi-vendeurs permettant de vendre et acheter des produits reconditionnés. Il intègre :

- ✅ **API REST** complète avec FastAPI
- ✅ **Interface moderne** avec React + Tailwind CSS
- ✅ **Authentification JWT** sécurisée
- ✅ **Rôles utilisateurs** (client, vendeur, admin)
- ✅ **Panier et commandes** multi-vendeurs
- ✅ **Dashboard vendeur** pour gérer ses produits
- ✅ **Dashboard administrateur** pour la modération
- ✅ **IA de génération de descriptions** produits (OpenAI/Anthropic/Google)
- ✅ **CLI de gestion** du projet

## 🏗️ Architecture

```
marketplace/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── models/       # Modèles SQLAlchemy
│   │   ├── routes/       # Routes API
│   │   ├── schemas/      # Schémas Pydantic
│   │   ├── core/         # Configuration & sécurité
│   │   ├── services/     # Service IA
│   │   └── main.py       # Application principale
│   └── requirements.txt
│
├── frontend/         # Application React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'app
│   │   ├── services/     # Services API
│   │   ├── stores/       # Stores Zustand
│   │   └── App.jsx
│   └── package.json
│
├── cli/              # Outil CLI Python
│   └── marketplace_cli.py
│
├── docs/             # Documentation & UML
│
└── README.md
```

## 🚀 Installation

### Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Cloner le projet

```bash
git clone <marketplace>
cd marketplace
```

### 2. Configuration de la base de données

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE marketplace_db;
CREATE USER marketplace_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;
```

### 3. Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos informations
```

Fichier `.env` :

```env
DATABASE_URL=postgresql://marketplace_user:votre_mot_de_passe@localhost:5432/marketplace_db
SECRET_KEY=votre-cle-secrete-super-longue-et-complexe
OPENAI_API_KEY=sk-xxx  # Optionnel pour l'IA
AI_PROVIDER=openai
```

```bash
# Créer les tables
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Lancer le serveur
uvicorn app.main:app --reload
```

API disponible sur : http://localhost:8000  
Documentation : http://localhost:8000/docs

### 4. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Application disponible sur : http://localhost:5173

## 🛠️ Utilisation du CLI

Le CLI facilite la gestion du projet :

```bash
cd cli

# Initialiser le projet
python marketplace_cli.py init

# Créer les tables
python marketplace_cli.py migrate

# Ajouter des données de test
python marketplace_cli.py seed

# Lancer l'application
python marketplace_cli.py run          # Backend + Frontend
python marketplace_cli.py run backend  # Backend seulement
python marketplace_cli.py run frontend # Frontend seulement

# Aide
python marketplace_cli.py help
```

## 👥 Comptes de test

Après avoir exécuté `seed`, vous aurez accès à :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@marketplace.com | admin123 |
| **Vendeur** | vendeur@marketplace.com | vendeur123 |
| **Client** | client@marketplace.com | client123 |

## 🎯 Fonctionnalités

### Pour les clients
- Parcourir le catalogue de produits
- Filtrer par catégorie, état, prix
- Ajouter au panier
- Passer des commandes
- Suivre ses commandes

### Pour les vendeurs
- Dashboard dédié
- CRUD complet sur les produits
- **Génération de descriptions par IA** 🤖
- Gestion des stocks
- Consultation des commandes

### Pour les administrateurs
- Dashboard de statistiques
- Gestion des utilisateurs (activation, blocage)
- Modération des produits
- Vue d'ensemble de la plateforme

## 🤖 Fonctionnalité IA

L'IA génère automatiquement des descriptions produits professionnelles :

**Entrées :**
- Nom du produit
- Marque
- Catégorie
- État
- Caractéristiques techniques

**Sortie :**
- Description e-commerce optimisée
- Ton rassurant et professionnel
- Modifiable par le vendeur

**Providers supportés :**
- OpenAI (GPT-4o-mini)
- Anthropic (Claude)
- Google (Gemini)

Configuration dans `.env` :

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
```

## 📡 API Documentation

L'API REST est automatiquement documentée via Swagger :

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

### Endpoints principaux

```
Auth
POST   /api/v1/auth/register      - Inscription
POST   /api/v1/auth/login         - Connexion
GET    /api/v1/auth/me            - Info utilisateur

Products
GET    /api/v1/products/          - Liste des produits
GET    /api/v1/products/{id}      - Détail produit
POST   /api/v1/products/          - Créer produit (vendeur)
PUT    /api/v1/products/{id}      - Modifier produit
DELETE /api/v1/products/{id}      - Supprimer produit
POST   /api/v1/products/ai/generate-description  - IA description

Cart
GET    /api/v1/cart/              - Voir le panier
POST   /api/v1/cart/              - Ajouter au panier
PUT    /api/v1/cart/{id}          - Modifier quantité
DELETE /api/v1/cart/{id}          - Supprimer item

Orders
GET    /api/v1/orders/            - Mes commandes
POST   /api/v1/orders/from-cart   - Commander depuis le panier
GET    /api/v1/orders/{id}        - Détail commande

Admin (gestion des vendeurs et vue d'ensemble du site uniquement)
GET    /api/v1/admin/vendors     - Liste des vendeurs
PUT    /api/v1/admin/vendors/{id}/activate   - Activer un vendeur
PUT    /api/v1/admin/vendors/{id}/deactivate - Désactiver un vendeur
PUT    /api/v1/admin/vendors/{id}/block      - Bloquer un vendeur
GET    /api/v1/admin/stats        - Vue d'ensemble (statistiques)
```

## 🔐 Sécurité

- Mots de passe hashés avec **bcrypt**
- Authentification **JWT**
- Tokens expirables (30min par défaut)
- Contrôle d'accès par **rôle**
- Protection **CORS**
- Validation des données avec **Pydantic**

## 🧪 Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📦 Déploiement

### Backend (Render / Railway)

```bash
# Variables d'environnement requises
DATABASE_URL=postgresql://...
SECRET_KEY=...
OPENAI_API_KEY=...  # Optionnel
```

### Frontend (Vercel / Netlify)

```bash
npm run build
# Déployer le dossier dist/
```

## 🛣️ Roadmap

- [ ] Paiement Stripe
- [ ] Notifications email
- [ ] Chat vendeur/client
- [ ] Recommandations produits (IA)
- [ ] Application mobile
- [ ] API GraphQL
- [ ] Tests E2E

## 📚 Documentation

- [Cahier des charges](docs/CAHIER_DES_CHARGES.md)
- [Documentation technique](docs/DOCUMENTATION_TECHNIQUE.md)
- [Diagrammes UML](docs/)

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Projet à usage pédagogique et démonstratif.

## 👨‍💻 Auteur

**Obraoll Dawn-smith**  
Formation : BTS SIO SLAM  
Année : 2025 - 2026

## 📞 Contact

- Email : smithdawnmaleka@gmail.com
- LinkedIn : [Dawn smith MALEKA](https://www.linkedin.com/in/dawn-smith-obraoll/)

---

⭐ **Si ce projet vous a plu, n'hésitez pas à mettre une étoile !**
