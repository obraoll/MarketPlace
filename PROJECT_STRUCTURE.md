# 📁 Structure complète du projet Marketplace

## Vue d'ensemble

```
marketplace/
│
├── 📄 README.md                    # Documentation principale
├── 📄 QUICK_START.md               # Démarrage rapide
├── 📄 PROJECT_STRUCTURE.md         # Ce fichier
├── 📄 .gitignore                   # Fichiers à ignorer par Git
├── 🔧 install.bat                  # Script d'installation Windows
├── 🔧 install.sh                   # Script d'installation Linux/macOS
│
├── 📂 backend/                     # API FastAPI
│   ├── 📂 app/
│   │   ├── 📂 core/                # Configuration & sécurité
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Settings Pydantic
│   │   │   ├── database.py         # Configuration SQLAlchemy
│   │   │   ├── security.py         # JWT & hashing
│   │   │   └── dependencies.py     # Dépendances FastAPI
│   │   │
│   │   ├── 📂 models/              # Modèles SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # Modèle User
│   │   │   ├── product.py          # Modèle Product
│   │   │   ├── order.py            # Modèles Order & OrderItem
│   │   │   └── cart.py             # Modèle CartItem
│   │   │
│   │   ├── 📂 schemas/             # Schémas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # Schémas User, Token
│   │   │   ├── product.py          # Schémas Product, IA
│   │   │   ├── order.py            # Schémas Order
│   │   │   └── cart.py             # Schémas Cart
│   │   │
│   │   ├── 📂 routes/              # Routes API
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Authentification
│   │   │   ├── products.py         # CRUD Produits + IA
│   │   │   ├── cart.py             # Gestion panier
│   │   │   ├── orders.py           # Gestion commandes
│   │   │   └── admin.py            # Administration
│   │   │
│   │   ├── 📂 services/            # Services métier
│   │   │   ├── __init__.py
│   │   │   └── ai_service.py       # Service génération IA
│   │   │
│   │   ├── __init__.py
│   │   └── main.py                 # Application FastAPI
│   │
│   ├── requirements.txt            # Dépendances Python
│   ├── .env.example                # Template variables d'env
│   ├── .env                        # Variables d'environnement (ignoré par Git)
│   └── .gitignore
│
├── 📂 frontend/                    # Application React
│   ├── 📂 public/
│   │   └── vite.svg
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/          # Composants réutilisables
│   │   │   ├── Navbar.jsx          # Barre de navigation
│   │   │   └── ProductCard.jsx     # Carte produit
│   │   │
│   │   ├── 📂 pages/               # Pages de l'application
│   │   │   ├── HomePage.jsx        # Page d'accueil
│   │   │   ├── LoginPage.jsx       # Connexion
│   │   │   ├── RegisterPage.jsx    # Inscription
│   │   │   ├── ProductsPage.jsx    # Liste produits
│   │   │   ├── ProductDetailPage.jsx # Détail produit
│   │   │   ├── CartPage.jsx        # Panier
│   │   │   ├── OrdersPage.jsx      # Mes commandes
│   │   │   ├── VendorDashboard.jsx # Dashboard vendeur
│   │   │   └── AdminDashboard.jsx  # Dashboard admin
│   │   │
│   │   ├── 📂 services/            # Services API
│   │   │   └── api.js              # Configuration Axios + API calls
│   │   │
│   │   ├── 📂 stores/              # State Management (Zustand)
│   │   │   ├── authStore.js        # Store authentification
│   │   │   └── cartStore.js        # Store panier
│   │   │
│   │   ├── 📂 utils/               # Utilitaires
│   │   │
│   │   ├── App.jsx                 # Composant principal + Router
│   │   ├── main.jsx                # Entry point React
│   │   └── index.css               # Styles Tailwind CSS
│   │
│   ├── index.html                  # HTML principal
│   ├── package.json                # Dépendances Node.js
│   ├── vite.config.js              # Configuration Vite
│   ├── tailwind.config.js          # Configuration Tailwind
│   ├── postcss.config.js           # Configuration PostCSS
│   └── .gitignore
│
├── 📂 cli/                         # Outil CLI Python
│   ├── marketplace_cli.py          # CLI principal
│   ├── README.md                   # Documentation CLI
│   └── requirements.txt            # Dépendances (vide)
│
└── 📂 docs/                        # Documentation
    ├── CAHIER_DES_CHARGES.md       # Cahier des charges (fourni)
    ├── DOCUMENTATION_TECHNIQUE.md  # Doc technique complète
    ├── GUIDE_DEMARRAGE.md          # Guide de démarrage détaillé
    └── UML_DIAGRAMS.md             # Diagrammes UML
```

## 📊 Statistiques du projet

### Backend
- **Fichiers Python** : ~20
- **Lignes de code** : ~2500
- **Routes API** : 30+
- **Modèles** : 5
- **Schémas** : 15+

### Frontend
- **Composants React** : 10+
- **Pages** : 9
- **Lignes de code** : ~2000
- **Stores Zustand** : 2

### Total
- **Fichiers** : ~50
- **Lignes de code** : ~5000
- **Technologies** : 10+

## 🎯 Fonctionnalités par fichier

### Backend

| Fichier | Fonctionnalités |
|---------|-----------------|
| `routes/auth.py` | Inscription, Connexion, JWT |
| `routes/products.py` | CRUD produits, Filtres, IA descriptions |
| `routes/cart.py` | Panier : ajouter, modifier, supprimer |
| `routes/orders.py` | Créer commande, Historique, Statuts |
| `routes/admin.py` | Gestion users, Modération, Stats |
| `services/ai_service.py` | Génération descriptions (OpenAI/Claude/Gemini) |
| `core/security.py` | JWT, Hashage Bcrypt |
| `core/dependencies.py` | Auth middleware, Contrôle rôles |

### Frontend

| Fichier | Fonctionnalités |
|---------|-----------------|
| `pages/HomePage.jsx` | Landing page, CTA |
| `pages/ProductsPage.jsx` | Liste produits, Filtres |
| `pages/CartPage.jsx` | Panier, Checkout |
| `pages/VendorDashboard.jsx` | CRUD produits, IA |
| `pages/AdminDashboard.jsx` | Stats, Modération |
| `stores/authStore.js` | State auth, Login/Logout |
| `stores/cartStore.js` | State panier, CRUD |
| `services/api.js` | Axios, Intercepteurs, API calls |

### CLI

| Fichier | Fonctionnalités |
|---------|-----------------|
| `marketplace_cli.py` | init, migrate, seed, run, help |

## 🔄 Flux de données

```
User Input (Frontend)
    ↓
React Component
    ↓
Zustand Store (optional)
    ↓
API Service (Axios)
    ↓
FastAPI Route
    ↓
Pydantic Validation
    ↓
Business Logic
    ↓
SQLAlchemy ORM
    ↓
PostgreSQL Database
```

## 🚀 Commandes principales

### Installation
```bash
# Windows
install.bat

# Linux/macOS
chmod +x install.sh
./install.sh
```

### Développement
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev

# CLI
cd cli
python marketplace_cli.py run
```

### Production
```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
```

## 📦 Dépendances principales

### Backend (Python)
- **FastAPI** : Framework web
- **SQLAlchemy** : ORM
- **Pydantic** : Validation
- **python-jose** : JWT
- **passlib** : Hashing
- **psycopg2** : PostgreSQL driver
- **openai** : API OpenAI

### Frontend (Node.js)
- **React** : UI Library
- **React Router** : Routing
- **Zustand** : State management
- **Axios** : HTTP client
- **Tailwind CSS** : Styling
- **Vite** : Build tool

## 🔐 Variables d'environnement

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sk-xxx
AI_PROVIDER=openai
ALLOWED_ORIGINS=http://localhost:5173
```

## 📝 Conventions de code

### Python
- **Style** : PEP 8
- **Docstrings** : Google style
- **Imports** : Groupés (stdlib, third-party, local)

### JavaScript
- **Style** : ESLint + Prettier
- **Composants** : PascalCase
- **Fonctions** : camelCase

## 🧪 Tests (à implémenter)

```
backend/
└── tests/
    ├── test_auth.py
    ├── test_products.py
    ├── test_orders.py
    └── test_ai_service.py

frontend/
└── src/
    └── __tests__/
        ├── HomePage.test.jsx
        ├── CartPage.test.jsx
        └── stores/
            └── authStore.test.js
```

## 📚 Documentation disponible

1. **README.md** : Vue d'ensemble, installation, utilisation
2. **QUICK_START.md** : Démarrage en 5 minutes
3. **docs/GUIDE_DEMARRAGE.md** : Guide détaillé pas à pas
4. **docs/DOCUMENTATION_TECHNIQUE.md** : Architecture, API, modèles
5. **docs/UML_DIAGRAMS.md** : Diagrammes de classes, séquences, etc.
6. **docs/CAHIER_DES_CHARGES.md** : Spécifications du projet

## 🎓 Points d'apprentissage

Ce projet couvre :

✅ **Backend** : FastAPI, SQLAlchemy, JWT, API REST  
✅ **Frontend** : React, Hooks, State management, Routing  
✅ **Base de données** : PostgreSQL, Relations, Migrations  
✅ **Sécurité** : Authentification, Autorisation, CORS  
✅ **IA** : Intégration API OpenAI/Claude  
✅ **CLI** : Scripting Python, argparse  
✅ **DevOps** : Git, Docker (à venir)  
✅ **Architecture** : MVC, Layered architecture, Clean code

---

**Date de création** : Février 2026  
**Version** : 1.0.0  
**Auteur** : Votre nom
