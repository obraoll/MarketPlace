#!/usr/bin/env python3
"""
Test complet du système JWT
"""
from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, get_password_hash, verify_password
from app.core.database import SessionLocal
from app.models import User

print("=" * 60)
print("🔍 TEST COMPLET JWT")
print("=" * 60)

# Test 1: Configuration
print("\n1️⃣ Configuration JWT")
print(f"   SECRET_KEY: {settings.SECRET_KEY[:20]}... (longueur: {len(settings.SECRET_KEY)})")
print(f"   ALGORITHM: {settings.ALGORITHM}")
print(f"   EXPIRE_MINUTES: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")

# Test 2: Création de token
print("\n2️⃣ Création d'un token")
test_data = {"sub": 1, "email": "admin@marketplace.com", "role": "admin"}
token = create_access_token(test_data)
print(f"   Token créé: {token[:50]}...")
print(f"   Longueur: {len(token)}")

# Test 3: Décodage du même token
print("\n3️⃣ Décodage du token")
decoded = decode_access_token(token)
if decoded:
    print(f"   ✅ Token décodé avec succès")
    print(f"   user_id: {decoded.get('sub')}")
    print(f"   email: {decoded.get('email')}")
    print(f"   role: {decoded.get('role')}")
else:
    print(f"   ❌ Impossible de décoder le token")

# Test 4: Vérifier l'utilisateur dans la DB
print("\n4️⃣ Vérification utilisateur dans la base")
db = SessionLocal()
try:
    user = db.query(User).filter(User.id == 1).first()
    if user:
        print(f"   ✅ Utilisateur trouvé")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   is_active: {user.is_active}")
        print(f"   is_blocked: {user.is_blocked}")
    else:
        print(f"   ❌ Utilisateur ID 1 non trouvé")
finally:
    db.close()

# Test 5: Test mot de passe
print("\n5️⃣ Test hashage mot de passe")
password = "admin123"
hashed = get_password_hash(password)
print(f"   Hash créé: {hashed[:30]}...")

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == "admin@marketplace.com").first()
    if user:
        is_valid = verify_password(password, user.hashed_password)
        print(f"   Vérification mot de passe: {'✅ Valide' if is_valid else '❌ Invalide'}")
        
        if not is_valid:
            print(f"\n   ⚠️ Le hash dans la DB ne correspond pas!")
            print(f"   Hash en DB: {user.hashed_password[:30]}...")
    else:
        print(f"   ❌ Utilisateur admin non trouvé")
finally:
    db.close()

print("\n" + "=" * 60)
print("✅ Tests terminés")
print("=" * 60)
