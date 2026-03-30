# Tests Marketplace

## Installation

```bash
pip install pytest pytest-cov pytest-asyncio
```

## Lancer les tests

```bash
# Tous les tests
pytest

# Avec couverture
pytest --cov=app tests/

# Tests spécifiques
pytest tests/test_auth.py
pytest tests/test_products.py

# Mode verbose
pytest -v

# Avec rapport HTML de couverture
pytest --cov=app --cov-report=html tests/
```

## Structure

```
tests/
├── __init__.py
├── conftest.py           # Fixtures partagées
├── test_auth.py          # Tests authentification
├── test_products.py      # Tests produits
├── test_cart.py          # Tests panier
└── README.md             # Ce fichier
```

## Fixtures disponibles

- `db_session` - Session de base de données de test (SQLite en mémoire)
- `client` - Client de test FastAPI
- `test_user` - Utilisateur client de test
- `test_vendeur` - Utilisateur vendeur de test
- `test_admin` - Utilisateur admin de test
- `test_product` - Produit de test
- `auth_headers` - Headers d'authentification pour un client
- `vendeur_headers` - Headers d'authentification pour un vendeur
- `admin_headers` - Headers d'authentification pour un admin

## Exemples

```python
def test_example(client, test_user, auth_headers):
    \"\"\"Exemple de test avec fixtures\"\"\"
    response = client.get("/api/v1/products/", headers=auth_headers)
    assert response.status_code == 200
```

## Couverture cible

- **Unit Tests:** 70%
- **Integration Tests:** 60%
- **E2E Tests:** Scénarios critiques

## TODO

- [ ] Ajouter tests pour orders
- [ ] Ajouter tests pour admin
- [ ] Ajouter tests pour AI service
- [ ] Ajouter tests E2E avec Playwright
