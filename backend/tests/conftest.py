"""
Configuration pytest et fixtures partagées
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models import User, Product, UserRole, ProductCategory, ProductCondition
from app.core.security import get_password_hash


# Base de données en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Désactiver le rate limiting pendant les tests
@pytest.fixture(autouse=True)
def disable_rate_limiting():
    """Désactive le rate limiting pour les tests"""
    # Désactivation propre: garder l'objet limiter réel pour éviter
    # les erreurs async dans le handler SlowAPI.
    if hasattr(app.state, 'limiter'):
        limiter = app.state.limiter
        original_enabled = getattr(limiter, "enabled", True)
        limiter.enabled = False
        yield
        limiter.enabled = original_enabled
    else:
        yield


@pytest.fixture(scope="function")
def db_session():
    """Crée une session de base de données pour les tests"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Client de test FastAPI avec base de données de test"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Crée un utilisateur de test"""
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("test123"),
        first_name="Test",
        last_name="User",
        role=UserRole.CLIENT,
        is_active=True,
        is_blocked=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_vendeur(db_session):
    """Crée un vendeur de test"""
    vendeur = User(
        email="vendeur@example.com",
        hashed_password=get_password_hash("vendeur123"),
        first_name="Vendeur",
        last_name="Test",
        role=UserRole.VENDEUR,
        is_active=True,
        is_blocked=False
    )
    db_session.add(vendeur)
    db_session.commit()
    db_session.refresh(vendeur)
    return vendeur


@pytest.fixture
def test_admin(db_session):
    """Crée un admin de test"""
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        first_name="Admin",
        last_name="Test",
        role=UserRole.ADMIN,
        is_active=True,
        is_blocked=False
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def test_product(db_session, test_vendeur):
    """Crée un produit de test"""
    product = Product(
        name="iPhone 12 Pro Test",
        brand="Apple",
        category=ProductCategory.SMARTPHONE,
        condition=ProductCondition.EXCELLENT,
        price=699.99,
        stock=10,
        description="Produit de test",
        seller_id=test_vendeur.id,
        is_active=True
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def auth_headers(client, test_user):
    """Retourne les headers d'authentification pour un utilisateur"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "test123"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "access_token" in data, f"No access_token in response: {data}"
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def vendeur_headers(client, test_vendeur):
    """Retourne les headers d'authentification pour un vendeur"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "vendeur@example.com", "password": "vendeur123"}
    )
    assert response.status_code == 200, f"Vendeur login failed: {response.text}"
    data = response.json()
    assert "access_token" in data, f"No access_token in response: {data}"
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, test_admin):
    """Retourne les headers d'authentification pour un admin"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    assert "access_token" in data, f"No access_token in response: {data}"
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}
