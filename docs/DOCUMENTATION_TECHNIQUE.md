# 📚 Documentation Technique - Marketplace

## Table des matières

1. [Architecture](#architecture)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Base de données](#base-de-données)
5. [Sécurité](#sécurité)
6. [Service IA](#service-ia)
7. [CLI](#cli)
8. [Déploiement](#déploiement)

---

## Architecture

### Vue d'ensemble

```
┌─────────────┐      HTTP/REST      ┌─────────────┐
│   Frontend  │ ─────────────────> │   Backend   │
│  React SPA  │ <───────────────── │  FastAPI    │
└─────────────┘       JSON          └─────────────┘
                                           │
                                           │ SQLAlchemy
                                           ▼
                                    ┌─────────────┐
                                    │ PostgreSQL  │
                                    │  Database   │
                                    └─────────────┘
                                           
                                    ┌─────────────┐
                                    │   OpenAI    │
                                    │  (IA API)   │
                                    └─────────────┘
```

### Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React | 18.3+ |
| Styling | Tailwind CSS | 3.4+ |
| State Management | Zustand | 5.0+ |
| Routing | React Router | 6.28+ |
| HTTP Client | Axios | 1.7+ |
| Backend | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.0+ |
| Validation | Pydantic | 2.9+ |
| Auth | JWT (python-jose) | 3.3+ |
| Password | Passlib + Bcrypt | 1.7+ |
| Database | PostgreSQL | 14+ |
| IA | OpenAI/Anthropic/Google | Latest |

---

## Backend

### Structure

```
backend/
├── app/
│   ├── core/               # Configuration & sécurité
│   │   ├── config.py       # Settings Pydantic
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── security.py     # JWT & hashing
│   │   └── dependencies.py # FastAPI dependencies
│   │
│   ├── models/             # Modèles SQLAlchemy
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py
│   │
│   ├── schemas/            # Schémas Pydantic
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py
│   │
│   ├── routes/             # Routes API
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── orders.py
│   │   ├── cart.py
│   │   └── admin.py
│   │
│   ├── services/           # Services métier
│   │   └── ai_service.py
│   │
│   └── main.py             # Application FastAPI
│
├── requirements.txt
└── .env
```

### Modèles de données

#### User

```python
- id: Integer (PK)
- email: String (unique, indexed)
- hashed_password: String
- first_name: String
- last_name: String
- role: Enum (client, vendeur, admin)
- is_active: String ("true", "false", "blocked")
- created_at: DateTime
- updated_at: DateTime

Relations:
- products (1-N avec Product)
- orders (1-N avec Order)
- cart_items (1-N avec CartItem)
```

#### Product

```python
- id: Integer (PK)
- name: String (indexed)
- brand: String
- category: Enum (smartphone, ordinateur, tablette, ...)
- condition: Enum (excellent, bon, correct)
- price: Float
- stock: Integer
- description: Text
- specifications: Text (JSON string)
- image_url: String
- is_active: String
- seller_id: Integer (FK vers User)
- created_at: DateTime
- updated_at: DateTime

Relations:
- seller (N-1 avec User)
- order_items (1-N avec OrderItem)
- cart_items (1-N avec CartItem)
```

#### Order

```python
- id: Integer (PK)
- order_number: String (unique, indexed)
- status: Enum (pending, confirmed, shipped, delivered, cancelled)
- total_amount: Float
- customer_id: Integer (FK vers User)
- created_at: DateTime
- updated_at: DateTime

Relations:
- customer (N-1 avec User)
- items (1-N avec OrderItem)
```

#### OrderItem

```python
- id: Integer (PK)
- quantity: Integer
- unit_price: Float
- order_id: Integer (FK vers Order)
- product_id: Integer (FK vers Product)
- created_at: DateTime
```

#### CartItem

```python
- id: Integer (PK)
- quantity: Integer
- user_id: Integer (FK vers User)
- product_id: Integer (FK vers Product)
- created_at: DateTime
- updated_at: DateTime
```

### Authentification JWT

#### Flux d'authentification

```
1. Client POST /auth/login { email, password }
2. Backend vérifie les credentials
3. Backend génère un JWT avec payload: { sub: user_id, email, role, exp }
4. Client stocke le token dans localStorage
5. Client envoie le token dans le header: Authorization: Bearer <token>
6. Backend vérifie et décode le token via middleware
7. Backend retourne l'utilisateur dans les dépendances FastAPI
```

#### Structure du token JWT

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "client",
  "exp": 1735689600
}
```

#### Sécurité

- Algorithme : **HS256**
- Expiration : **30 minutes** (configurable)
- Secret : Variable d'environnement `SECRET_KEY`
- Hashage mot de passe : **Bcrypt** (12 rounds)

### Routes API

Toutes les routes sont préfixées par `/api/v1`

#### Auth (`/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/register` | ❌ | Inscription |
| POST | `/login` | ❌ | Connexion |
| GET | `/me` | ✅ | Info utilisateur |

#### Products (`/products`)

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| GET | `/` | ❌ | - | Liste produits |
| GET | `/{id}` | ❌ | - | Détail produit |
| POST | `/` | ✅ | Vendeur | Créer produit |
| PUT | `/{id}` | ✅ | Vendeur | Modifier produit |
| DELETE | `/{id}` | ✅ | Vendeur | Supprimer produit |
| GET | `/seller/my-products` | ✅ | Vendeur | Mes produits |
| POST | `/ai/generate-description` | ✅ | Vendeur | Générer description IA |

#### Cart (`/cart`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | ✅ | Voir panier |
| POST | `/` | ✅ | Ajouter au panier |
| PUT | `/{id}` | ✅ | Modifier quantité |
| DELETE | `/{id}` | ✅ | Supprimer item |
| DELETE | `/` | ✅ | Vider panier |

#### Orders (`/orders`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | ✅ | Mes commandes |
| GET | `/{id}` | ✅ | Détail commande |
| POST | `/` | ✅ | Créer commande |
| POST | `/from-cart` | ✅ | Commander depuis panier |
| PUT | `/{id}` | ✅ (Vendeur) | Modifier statut |
| GET | `/seller/orders` | ✅ (Vendeur) | Commandes vendeur |

#### Admin (`/admin`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/users` | ✅ (Admin) | Liste utilisateurs |
| PUT | `/users/{id}/activate` | ✅ (Admin) | Activer utilisateur |
| PUT | `/users/{id}/deactivate` | ✅ (Admin) | Désactiver utilisateur |
| PUT | `/users/{id}/block` | ✅ (Admin) | Bloquer utilisateur |
| GET | `/products` | ✅ (Admin) | Liste produits |
| PUT | `/products/{id}/moderate` | ✅ (Admin) | Modérer produit |
| GET | `/stats` | ✅ (Admin) | Statistiques |

---

## Frontend

### Structure

```
frontend/
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── Navbar.jsx
│   │   └── ProductCard.jsx
│   │
│   ├── pages/              # Pages de l'application
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── VendorDashboard.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── stores/             # State management (Zustand)
│   │   ├── authStore.js
│   │   └── cartStore.js
│   │
│   ├── services/           # API services
│   │   └── api.js
│   │
│   ├── utils/              # Utilitaires
│   ├── App.jsx             # Router & layout
│   ├── main.jsx            # Entry point
│   └── index.css           # Styles Tailwind
│
├── package.json
└── vite.config.js
```

### State Management (Zustand)

#### Auth Store

```javascript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  
  login(credentials) => Promise<boolean>,
  register(userData) => Promise<boolean>,
  logout() => void,
  checkAuth() => Promise<void>
}
```

#### Cart Store

```javascript
{
  items: CartItem[],
  isLoading: boolean,
  error: string | null,
  
  fetchCart() => Promise<void>,
  addToCart(productId, quantity) => Promise<boolean>,
  updateQuantity(itemId, quantity) => Promise<boolean>,
  removeItem(itemId) => Promise<boolean>,
  clearCart() => Promise<boolean>,
  getTotal() => number
}
```

### Routing

```javascript
/ → HomePage (public)
/login → LoginPage (public)
/register → RegisterPage (public)
/products → ProductsPage (public)
/products/:id → ProductDetailPage (public)
/cart → CartPage (protected)
/orders → OrdersPage (protected)
/vendor/dashboard → VendorDashboard (protected, role: vendeur)
/admin/dashboard → AdminDashboard (protected, role: admin)
```

### API Service

Axios instance configurée avec :
- Base URL : `http://localhost:8000/api/v1`
- Intercepteur pour ajouter le token JWT
- Gestion des erreurs centralisée

---

## Base de données

### Schéma relationnel

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │1       N│   Product    │1       N│  CartItem   │
│─────────────│◄────────│──────────────│◄────────│─────────────│
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ email       │         │ name         │         │ quantity    │
│ password    │         │ brand        │         │ user_id(FK) │
│ role        │         │ price        │         │ product_id  │
└─────────────┘         │ seller_id(FK)│         └─────────────┘
      │1                └──────────────┘
      │                       │1
      │                       │
      │N                      │N
┌─────────────┐         ┌──────────────┐
│    Order    │1       N│  OrderItem   │
│─────────────│◄────────│──────────────│
│ id (PK)     │         │ id (PK)      │
│ order_no    │         │ quantity     │
│ status      │         │ unit_price   │
│ total       │         │ order_id(FK) │
│ customer(FK)│         │ product_id   │
└─────────────┘         └──────────────┘
```

### Migrations

Utilise **SQLAlchemy** pour la création automatique des tables :

```python
from app.core.database import Base, engine
Base.metadata.create_all(bind=engine)
```

---

## Service IA

### Architecture

```python
class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER  # openai, anthropic, google
    
    async def generate_description(request: AIDescriptionRequest) -> str:
        # 1. Construire le prompt
        prompt = self._build_prompt(request)
        
        # 2. Appeler le provider
        if provider == "openai":
            return await self._generate_with_openai(prompt)
        elif provider == "anthropic":
            return await self._generate_with_anthropic(prompt)
        elif provider == "google":
            return await self._generate_with_google(prompt)
        else:
            return self._generate_fallback(request)
```

### Prompt engineering

```
Tu es un expert en e-commerce de produits reconditionnés.
Génère une description professionnelle et engageante pour ce produit :

Produit : iPhone 12 Pro
Marque : Apple
Catégorie : smartphone
État : excellent état, comme neuf
Caractéristiques : 128GB, 6GB RAM, Écran 6.1 pouces

La description doit :
- Être rassurante et professionnelle
- Mettre en avant la qualité du reconditionnement
- Mentionner la garantie et le contrôle qualité
- Être optimisée pour l'e-commerce
- Faire environ 150-200 mots
- Être en français
```

### Fallback

Si l'API IA n'est pas disponible, un texte générique est retourné :

```
Ce produit reconditionné de qualité a été rigoureusement testé...
```

---

## CLI

### Commandes disponibles

```bash
marketplace init       # Initialise le projet (.env)
marketplace migrate    # Crée les tables
marketplace seed       # Données de test
marketplace run        # Lance backend + frontend
marketplace help       # Affiche l'aide
```

### Implémentation

```python
class MarketplaceCLI:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
    
    def init(self): ...
    def run(self, service="all"): ...
    def migrate(self): ...
    def seed(self): ...
```

---

## Déploiement

### Backend (Render / Railway)

1. Créer une base PostgreSQL
2. Configurer les variables d'environnement
3. Déployer le code
4. Exécuter les migrations

```bash
# Variables d'environnement
DATABASE_URL=postgresql://...
SECRET_KEY=...
OPENAI_API_KEY=...
ALLOWED_ORIGINS=https://votre-frontend.vercel.app
```

### Frontend (Vercel / Netlify)

1. Build le projet
2. Déployer le dossier `dist/`

```bash
npm run build
```

Configuration `vite.config.js` :

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://votre-backend.render.com',
        changeOrigin: true,
      },
    },
  },
})
```

---

## Performance

### Backend
- **Indexation** sur email, product name, order_number
- **Pagination** avec skip/limit
- **Pool de connexions** PostgreSQL
- **Cache** (à implémenter : Redis)

### Frontend
- **Code splitting** avec React.lazy
- **Optimisation images** (à implémenter)
- **Service Worker** (à implémenter)

---

## Monitoring

### Logs
- FastAPI logs vers stdout
- Erreurs API tracées

### Métriques (à implémenter)
- Temps de réponse API
- Taux d'erreur
- Nombre de commandes/jour

---

## Sécurité

### Checklist

- ✅ HTTPS en production
- ✅ CORS configuré
- ✅ JWT avec expiration
- ✅ Mots de passe hashés
- ✅ Validation des inputs (Pydantic)
- ✅ Rate limiting (à implémenter)
- ✅ Protection CSRF (à implémenter)
- ✅ Helmet headers (à implémenter)

---

**Documentation maintenue par** : [Votre nom]  
**Dernière mise à jour** : Février 2026
