"""
Tests pour l'authentification
"""
import pytest
from fastapi import status


def test_register_user(client):
    """Test inscription d'un nouvel utilisateur"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword123",
            "first_name": "New",
            "last_name": "User",
            "role": "client"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["first_name"] == "New"
    assert data["role"] == "client"
    assert "hashed_password" not in data  # Ne doit pas exposer le mot de passe


def test_register_duplicate_email(client, test_user):
    """Test inscription avec email déjà utilisé"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",  # Email déjà utilisé
            "password": "password123",
            "first_name": "Duplicate",
            "last_name": "User",
            "role": "client"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "déjà utilisé" in response.json()["detail"].lower()


def test_login_success(client, test_user):
    """Test connexion réussie"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "test123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    """Test connexion avec mauvais mot de passe"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test connexion avec utilisateur inexistant"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user(client, test_user, auth_headers):
    """Test récupération infos utilisateur connecté"""
    response = client.get(
        "/api/v1/auth/me",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "client"


def test_get_current_user_without_token(client):
    """Test accès endpoint protégé sans token"""
    response = client.get("/api/v1/auth/me")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_login_inactive_user(client, db_session, test_user):
    """Test connexion avec compte désactivé"""
    # Désactiver l'utilisateur
    test_user.is_active = False
    db_session.commit()
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "test123"
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "désactivé" in response.json()["detail"].lower()


def test_login_blocked_user(client, db_session, test_user):
    """Test connexion avec compte bloqué"""
    # Bloquer l'utilisateur
    test_user.is_blocked = True
    db_session.commit()
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "test123"
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "bloqué" in response.json()["detail"].lower()
