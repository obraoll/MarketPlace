# 🚀 Guide de démarrage rapide - Marketplace

Ce guide vous permettra de lancer le projet en **moins de 10 minutes**.

## ⚡ Démarrage ultra-rapide

### 1. Prérequis

Assurez-vous d'avoir installé :

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

### 2. Installation en 3 commandes

```bash
# 1. Cloner et entrer dans le projet
git clone <votre-repo>
cd marketplace

# 2. Utiliser le CLI pour tout installer
cd cli
python marketplace_cli.py init
python marketplace_cli.py migrate
python marketplace_cli.py seed

# 3. Lancer l'application
python marketplace_cli.py run
```

C'est tout ! 🎉

---

## 📝 Installation manuelle détaillée

Si vous préférez tout contrôler :

### Étape 1 : Base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE marketplace_db;
CREATE USER marketplace_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;
\q
```

### Étape 2 : Backend

```bash
cd backend

# Environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp .env.example .env
```

Éditer `.env` :

```env
DATABASE_URL=postgresql://marketplace_user:password123@localhost:5432/marketplace_db
SECRET_KEY=changez-moi-en-production-avec-une-cle-longue-et-aleatoire
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optionnel : IA
OPENAI_API_KEY=sk-votre-cle-openai
AI_PROVIDER=openai

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

```bash
# Créer les tables
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Lancer le serveur
uvicorn app.main:app --reload
```

✅ Backend disponible sur http://localhost:8000  
📚 API Docs : http://localhost:8000/docs

### Étape 3 : Frontend

**Dans un nouveau terminal** :

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

✅ Frontend disponible sur http://localhost:5173

---

## 🧪 Tester l'application

### 1. Se connecter avec un compte de test

Allez sur http://localhost:5173/login

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Client** | client@marketplace.com | client123 |
| **Vendeur** | vendeur@marketplace.com | vendeur123 |
| **Admin** | admin@marketplace.com | admin123 |

### 2. Parcours client

1. **Parcourir les produits** : http://localhost:5173/products
2. **Voir un produit** : Cliquer sur un produit
3. **Ajouter au panier** : Cliquer sur "Ajouter au panier"
4. **Voir le panier** : http://localhost:5173/cart
5. **Commander** : Cliquer sur "Commander"
6. **Voir ses commandes** : http://localhost:5173/orders

### 3. Parcours vendeur

1. **Se connecter** : vendeur@marketplace.com / vendeur123
2. **Dashboard** : http://localhost:5173/vendor/dashboard
3. **Ajouter un produit** : Cliquer sur "+ Nouveau produit"
4. **Tester l'IA** : Remplir le formulaire et cliquer sur "🤖 Générer avec IA"
5. **Sauvegarder** : Créer le produit

### 4. Parcours admin

1. **Se connecter** : admin@marketplace.com / admin123
2. **Dashboard** : http://localhost:5173/admin/dashboard
3. **Statistiques** : Voir les stats globales
4. **Gérer les utilisateurs** : Activer/Bloquer des comptes
5. **Modérer les produits** : Activer/Désactiver des produits

---

## 🔧 Commandes utiles

### Backend

```bash
# Lancer le serveur
uvicorn app.main:app --reload

# Lancer avec un port spécifique
uvicorn app.main:app --reload --port 8001

# Voir les logs
uvicorn app.main:app --reload --log-level debug

# Recréer les tables (⚠️ perte de données)
python -c "from app.core.database import Base, engine; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Installer une dépendance
npm install package-name
```

### CLI

```bash
cd cli

# Initialiser
python marketplace_cli.py init

# Créer les tables
python marketplace_cli.py migrate

# Données de test
python marketplace_cli.py seed

# Lancer tout
python marketplace_cli.py run

# Lancer seulement le backend
python marketplace_cli.py run backend

# Lancer seulement le frontend
python marketplace_cli.py run frontend

# Aide
python marketplace_cli.py help
```

---

## 🐛 Résolution des problèmes

### Erreur de connexion à la base de données

```
sqlalchemy.exc.OperationalError: connection to server failed
```

**Solution** :
- Vérifier que PostgreSQL est lancé
- Vérifier les credentials dans `.env`
- Vérifier que la base existe

```bash
# Vérifier PostgreSQL
psql -U postgres -l
```

### Port déjà utilisé

```
ERROR: Address already in use
```

**Solution** :
```bash
# Trouver le process
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Tuer le process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux

# Ou utiliser un autre port
uvicorn app.main:app --reload --port 8001
```

### Module non trouvé

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution** :
```bash
# Vérifier l'environnement virtuel
which python  # Doit pointer vers venv/

# Réinstaller
pip install -r requirements.txt
```

### CORS Error dans le navigateur

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution** :
- Vérifier `ALLOWED_ORIGINS` dans `.env`
- Vérifier que le backend tourne sur port 8000
- Vérifier que le frontend tourne sur port 5173

---

## 📚 Ressources

### Documentation

- [README principal](../README.md)
- [Documentation technique](DOCUMENTATION_TECHNIQUE.md)
- [Cahier des charges](CAHIER_DES_CHARGES.md)

### API

- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

### Technologies

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [SQLAlchemy](https://www.sqlalchemy.org/)

---

## 💡 Prochaines étapes

Une fois que tout fonctionne :

1. **Personnaliser** : Modifier les couleurs, le logo, etc.
2. **Ajouter des produits** : Via le dashboard vendeur
3. **Tester l'IA** : Générer des descriptions avec OpenAI
4. **Explorer l'API** : Via Swagger http://localhost:8000/docs
5. **Lire la doc technique** : Pour comprendre l'architecture

---

## ❓ Besoin d'aide ?

- Documentation : `docs/`
- Issues : Créer une issue sur GitHub
- Contact : votre.email@example.com

---

🎉 **Bon développement !**
