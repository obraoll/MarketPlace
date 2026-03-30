# Changelog

Tous les changements notables de ce projet sont documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2026-02-10

### ✨ Ajouté
- Tests unitaires avec pytest (auth, products, cart)
- Rate limiting sur /auth/login (5 tentatives/minute)
- Logging structuré en JSON
- Utilitaires de permissions réutilisables
- Docker Compose pour déploiement
- Dockerfiles backend et frontend
- Configuration EditorConfig
- Environnement ENVIRONMENT (dev/staging/prod)

### 🔧 Modifié
- **BREAKING:** `is_active` changé de String à Boolean dans User et Product
- **BREAKING:** Ajout du champ `is_blocked` dans User
- Correction `datetime.utcnow()` obsolète → `datetime.now(timezone.utc)`
- SECRET_KEY généré automatiquement si non fourni
- CORS restrictif en production
- Optimisation requêtes avec `joinedload()` (N+1 queries)
- Validation et sanitization des inputs de recherche

### 🔒 Sécurité
- Rate limiting sur login (protection brute-force)
- SECRET_KEY forte générée automatiquement
- CORS restrictif en production
- Logging des événements de sécurité

### 🐛 Corrigé
- Correction problème encodage bcrypt
- Longueur colonnes MySQL optimisée (index utf8mb4)
- Suppression dossier .venv à la racine (2.56 GB libérés)

### 🗑️ Supprimé
- Dossier .venv dupliqué à la racine

## [1.0.0] - 2026-02-08

### ✨ Version Initiale
- API REST FastAPI complète
- Interface React avec Tailwind CSS
- Authentification JWT
- Gestion multi-rôles (client, vendeur, admin)
- Panier et commandes
- Dashboard vendeur et admin
- Génération IA de descriptions produits
- Support MySQL et PostgreSQL
- CLI de gestion
- Documentation complète
