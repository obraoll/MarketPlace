#!/usr/bin/env python3
"""
Script pour réinitialiser les mots de passe des comptes de test
"""
import sys
from app.core.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

def reset_passwords():
    """Réinitialise les mots de passe des comptes de test"""
    print("🔑 Réinitialisation des mots de passe")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Comptes à réinitialiser
        accounts = [
            ("admin@marketplace.com", "admin123"),
            ("vendeur@marketplace.com", "vendeur123"),
            ("client@marketplace.com", "client123"),
        ]
        
        for email, password in accounts:
            user = db.query(User).filter(User.email == email).first()
            
            if user:
                # Réinitialiser le mot de passe
                user.hashed_password = get_password_hash(password)
                print(f"✅ {email} - Mot de passe réinitialisé")
            else:
                print(f"❌ {email} - Utilisateur non trouvé")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print("✨ Mots de passe réinitialisés avec succès !")
        print("\n📝 Comptes de test :")
        print("   Admin   : admin@marketplace.com / admin123")
        print("   Vendeur : vendeur@marketplace.com / vendeur123")
        print("   Client  : client@marketplace.com / client123")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERREUR : {str(e)}")
        print("=" * 60)
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    success = reset_passwords()
    sys.exit(0 if success else 1)
