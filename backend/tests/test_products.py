"""
Tests pour les produits
"""
import pytest
from fastapi import status


def test_get_products(client, test_product):
    """Test récupération liste des produits"""
    response = client.get("/api/v1/products/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "iPhone 12 Pro Test"


def test_get_product_by_id(client, test_product):
    """Test récupération d'un produit par ID"""
    response = client.get(f"/api/v1/products/{test_product.id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_product.id
    assert data["name"] == "iPhone 12 Pro Test"
    assert data.get("seller") is not None
    assert data["seller"]["id"] == test_product.seller_id
    assert data["seller"]["display_name"] == "Vendeur T."


def test_get_nonexistent_product(client):
    """Test récupération d'un produit inexistant"""
    response = client.get("/api/v1/products/9999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_product_as_vendeur(client, test_vendeur, vendeur_headers):
    """Test création de produit par un vendeur"""
    response = client.post(
        "/api/v1/products/",
        headers=vendeur_headers,
        json={
            "name": "MacBook Pro Test",
            "brand": "Apple",
            "category": "ordinateur",
            "condition": "excellent",
            "price": 1299.99,
            "stock": 5,
            "description": "MacBook Pro de test"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "MacBook Pro Test"
    assert data["price"] == 1299.99


def test_create_product_as_client(client, test_user, auth_headers):
    """Test création de produit par un client (interdit)"""
    response = client.post(
        "/api/v1/products/",
        headers=auth_headers,
        json={
            "name": "MacBook Pro Test",
            "brand": "Apple",
            "category": "ordinateur",
            "condition": "excellent",
            "price": 1299.99,
            "stock": 5,
            "description": "Test"
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_create_product_without_auth(client):
    """Test création de produit sans authentification"""
    response = client.post(
        "/api/v1/products/",
        json={
            "name": "MacBook Pro Test",
            "brand": "Apple",
            "category": "ordinateur",
            "condition": "excellent",
            "price": 1299.99,
            "stock": 5
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_filter_products_by_category(client, test_product):
    """Test filtrage des produits par catégorie"""
    response = client.get("/api/v1/products/?category=smartphone")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(p["category"] == "smartphone" for p in data)


def test_filter_products_by_price_range(client, test_product):
    """Test filtrage des produits par fourchette de prix"""
    response = client.get("/api/v1/products/?min_price=500&max_price=800")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(500 <= p["price"] <= 800 for p in data)


def test_search_products(client, test_product):
    """Test recherche de produits"""
    response = client.get("/api/v1/products/?search=iPhone")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "iPhone" in data[0]["name"]


def test_update_product_as_owner(client, test_product, vendeur_headers):
    """Test modification de produit par le propriétaire"""
    response = client.put(
        f"/api/v1/products/{test_product.id}",
        headers=vendeur_headers,
        json={
            "price": 649.99,
            "stock": 15
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["price"] == 649.99
    assert data["stock"] == 15


def test_delete_product_as_owner(client, test_product, vendeur_headers):
    """Test suppression de produit par le propriétaire"""
    response = client.delete(
        f"/api/v1/products/{test_product.id}",
        headers=vendeur_headers
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Vérifier que le produit n'existe plus
    get_response = client.get(f"/api/v1/products/{test_product.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
