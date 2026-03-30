# 🛠️ Marketplace CLI

Outil en ligne de commande pour faciliter la gestion du projet Marketplace.

## Installation

```bash
cd cli
pip install -r requirements.txt
```

## Utilisation

### Initialiser le projet
```bash
python marketplace_cli.py init
```

### Créer la base de données
```bash
python marketplace_cli.py migrate
```

### Ajouter des données de test
```bash
python marketplace_cli.py seed
```

### Lancer l'application
```bash
# Backend seulement
python marketplace_cli.py run backend

# Frontend seulement
python marketplace_cli.py run frontend

# Backend + Frontend
python marketplace_cli.py run
```

### Aide
```bash
python marketplace_cli.py help
```

## Comptes de test

Après avoir exécuté `seed`, vous aurez accès à :

- **Admin** : admin@marketplace.com / admin123
- **Vendeur** : vendeur@marketplace.com / vendeur123
- **Client** : client@marketplace.com / client123
