#!/usr/bin/env python3
"""
Script d'initialisation de la base de données MySQL
Crée toutes les tables nécessaires
"""
import sys
from sqlalchemy import text
from app.core.database import Base, engine, SessionLocal
from app.models import User, Product, Order, OrderItem, CartItem
from app.models.user import UserRole
from app.models.product import ProductCategory, ProductCondition
from app.models.order import OrderStatus
from app.core.security import get_password_hash

def create_tables():
    """Créer toutes les tables"""
    print("🔨 Création des tables MySQL")
    print("=" * 60)
    
    try:
        # Créer toutes les tables
        Base.metadata.create_all(bind=engine)
        
        # Vérifier les tables créées
        with engine.connect() as connection:
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            
            print(f"✅ Tables créées avec succès ({len(tables)}):")
            for table in tables:
                print(f"   - {table[0]}")
        
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ ERREUR lors de la création des tables:")
        print(f"   {str(e)}")
        print("=" * 60)
        return False

def seed_initial_data():
    """Ajouter des données de test"""
    print("\n🌱 Ajout des données de test")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Vérifier si des utilisateurs existent déjà
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  Des utilisateurs existent déjà. Aucune donnée ajoutée.")
            return True
        
        # Créer les utilisateurs de test
        users = [
            User(
                email="admin@marketplace.com",
                hashed_password=get_password_hash("admin123"),
                first_name="Admin",
                last_name="Marketplace",
                role=UserRole.ADMIN,
                is_active=True,
                is_blocked=False
            ),
            User(
                email="vendeur@marketplace.com",
                hashed_password=get_password_hash("vendeur123"),
                first_name="Jean",
                last_name="Vendeur",
                role=UserRole.VENDEUR,
                is_active=True,
                is_blocked=False
            ),
            User(
                email="client@marketplace.com",
                hashed_password=get_password_hash("client123"),
                first_name="Marie",
                last_name="Cliente",
                role=UserRole.CLIENT,
                is_active=True,
                is_blocked=False
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print("✅ Utilisateurs créés:")
        for user in users:
            print(f"   - {user.email} ({user.role.value})")
        
        # Créer des produits de test
        vendeur = db.query(User).filter(User.email == "vendeur@marketplace.com").first()
        
        products = [
            Product(
                name="iPhone 12 Pro",
                brand="Apple",
                category=ProductCategory.SMARTPHONE,
                condition=ProductCondition.EXCELLENT,
                price=699.99,
                stock=10,
                description="iPhone 12 Pro reconditionné en excellent état. Garantie 1 an.",
                specifications='{"RAM": "6GB", "Storage": "128GB", "Screen": "6.1 inches"}',
                image_url="https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07",
                seller_id=vendeur.id,
                is_active=True
            ),
            Product(
                name="MacBook Pro 13",
                brand="Apple",
                category=ProductCategory.ORDINATEUR,
                condition=ProductCondition.BON,
                price=1299.99,
                stock=5,
                description="MacBook Pro 13 pouces reconditionné, idéal pour les professionnels.",
                specifications='{"RAM": "16GB", "Storage": "512GB SSD", "Processor": "M1"}',
                image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
                seller_id=vendeur.id,
                is_active=True
            ),
            Product(
                name="iPad Air",
                brand="Apple",
                category=ProductCategory.TABLETTE,
                condition=ProductCondition.EXCELLENT,
                price=449.99,
                stock=15,
                description="iPad Air reconditionné comme neuf. Parfait pour le travail et le divertissement.",
                specifications='{"RAM": "4GB", "Storage": "64GB", "Screen": "10.9 inches"}',
                image_url="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
                seller_id=vendeur.id,
                is_active=True
            ),
            Product(
                name="Samsung Galaxy S21",
                brand="Samsung",
                category=ProductCategory.SMARTPHONE,
                condition=ProductCondition.BON,
                price=499.99,
                stock=8,
                description="Samsung Galaxy S21 reconditionné en bon état.",
                specifications='{"RAM": "8GB", "Storage": "128GB", "Screen": "6.2 inches"}',
                image_url="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c",
                seller_id=vendeur.id,
                is_active=True
            ),
            Product(
                name="AirPods Pro",
                brand="Apple",
                category=ProductCategory.ECOUTEURS,
                condition=ProductCondition.EXCELLENT,
                price=189.99,
                stock=20,
                description="AirPods Pro reconditionnés avec réduction de bruit active.",
                specifications='{"Battery": "4.5h", "Charging": "Wireless", "Noise Cancellation": "Yes"}',
                image_url="https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7",
                seller_id=vendeur.id,
                is_active=True
            ),
        ]
        
        for product in products:
            db.add(product)
        
        db.commit()
        print(f"✅ Produits créés ({len(products)}):")
        for product in products:
            print(f"   - {product.name} - {product.price}€")
        
        print("\n" + "=" * 60)
        print("✨ Données de test ajoutées avec succès !")
        print("\n📝 Comptes de test:")
        print("   Admin    : admin@marketplace.com / admin123")
        print("   Vendeur  : vendeur@marketplace.com / vendeur123")
        print("   Client   : client@marketplace.com / client123")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ ERREUR lors de l'ajout des données:")
        print(f"   {str(e)}")
        print("=" * 60)
        return False
        
    finally:
        db.close()

def main():
    """Fonction principale"""
    print("\n🐬 INITIALISATION DE LA BASE DE DONNÉES MYSQL")
    print("=" * 60)
    
    # Étape 1: Créer les tables
    if not create_tables():
        sys.exit(1)
    
    # Étape 2: Ajouter des données de test
    if not seed_initial_data():
        sys.exit(1)
    
    print("\n✅ Initialisation terminée avec succès !")
    print("\n🚀 Pour lancer l'application:")
    print("   uvicorn app.main:app --reload")
    print()

if __name__ == "__main__":
    main()
