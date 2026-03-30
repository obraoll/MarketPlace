#!/usr/bin/env python3
"""
Test du décodage JWT
"""
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import create_access_token, decode_access_token
import traceback

print("=" * 60)
print("TEST JWT - Création et Décodage")
print("=" * 60)

# Test 1: Créer un token
print("\n1. Création d'un token")
data = {"sub": "1", "email": "admin@marketplace.com", "role": "admin"}  # ✅ sub en string
token = create_access_token(data)
print(f"Token créé: {token[:50]}...")

# Test 2: Décoder avec la fonction personnalisée
print("\n2. Décodage avec decode_access_token()")
decoded = decode_access_token(token)
if decoded:
    print(f"✅ Succès: {decoded}")
else:
    print(f"❌ Échec: Retourne None")

# Test 3: Décoder directement avec jose
print("\n3. Décodage direct avec jose.jwt.decode()")
try:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    print(f"✅ Succès: {payload}")
except JWTError as e:
    print(f"❌ JWTError: {e}")
    traceback.print_exc()
except Exception as e:
    print(f"❌ Exception: {e}")
    traceback.print_exc()

# Test 4: Vérifier la SECRET_KEY
print("\n4. Vérification SECRET_KEY")
print(f"SECRET_KEY: {settings.SECRET_KEY}")
print(f"Type: {type(settings.SECRET_KEY)}")
print(f"Longueur: {len(settings.SECRET_KEY)}")

print("\n" + "=" * 60)
