#!/usr/bin/env python3
"""
Script de test de connexion MySQL
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def test_connection():
    """Test de connexion à MySQL"""
    print("🔍 Test de connexion MySQL")
    print("=" * 60)
    print(f"📊 DATABASE_URL: {settings.DATABASE_URL}")
    print("=" * 60)
    
    try:
        # Créer l'engine
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        
        # Tester la connexion
        print("\n⏳ Tentative de connexion...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()[0]
            
            print(f"✅ Connexion réussie !")
            print(f"📌 Version MySQL: {version}")
            
            # Vérifier la base de données
            result = connection.execute(text("SELECT DATABASE()"))
            database = result.fetchone()[0]
            print(f"📂 Base de données: {database}")
            
            # Lister les tables existantes
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            
            if tables:
                print(f"\n📋 Tables existantes ({len(tables)}):")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("\n⚠️  Aucune table trouvée (base de données vide)")
            
            print("\n" + "=" * 60)
            print("✨ Test terminé avec succès !")
            return True
            
    except Exception as e:
        print(f"\n❌ ERREUR de connexion:")
        print(f"   {str(e)}")
        print("\n💡 Vérifications:")
        print("   1. MySQL est-il lancé ?")
        print("   2. La base de données existe-t-elle ?")
        print("   3. L'utilisateur et le mot de passe sont-ils corrects ?")
        print("   4. PyMySQL est-il installé ? (pip install pymysql)")
        print("\n" + "=" * 60)
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
