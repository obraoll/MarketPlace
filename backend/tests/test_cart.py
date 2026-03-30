"""
Tests pour le panier
"""
import pytest
from fastapi import status


def test_get_cart(client, test_user, auth_headers):
    """Test récupération du panier"""
    response = client.get("/api/v1/cart/", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)


def test_add_to_cart(client, test_user, test_product, auth_headers):
    """Test ajout d'un produit au panier"""
    response = client.post(
        "/api/v1/cart/",
        headers=auth_headers,
        json={
            "product_id": test_product.id,
            "quantity": 2
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["product_id"] == test_product.id
    assert data["quantity"] == 2


def test_add_to_cart_without_auth(client, test_product):
    """Test ajout au panier sans authentification"""
    response = client.post(
        "/api/v1/cart/",
        json={
            "product_id": test_product.id,
            "quantity": 1
        }
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
