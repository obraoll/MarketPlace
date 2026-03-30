"""
Outil CLI pour la gestion du projet Marketplace
"""
import argparse
import os
import sys
import subprocess
from pathlib import Path


class MarketplaceCLI:
    """Gestionnaire CLI pour le projet Marketplace"""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
    
    def init(self):
        """Initialise le projet"""
        print("🚀 Initialisation du projet Marketplace...")
        
        # Vérifier si .env existe
        env_file = self.backend_dir / ".env"
        env_example = self.backend_dir / ".env.example"
        
        if not env_file.exists() and env_example.exists():
            print("📄 Copie du fichier .env.example vers .env")
            import shutil
            shutil.copy(env_example, env_file)
            print("⚠️  N'oubliez pas de configurer vos variables d'environnement dans .env")
        
        print("✅ Initialisation terminée !")
        print("\nProchaines étapes :")
        print("1. Configurez le fichier backend/.env avec vos informations")
        print("2. Lancez 'marketplace migrate' pour créer la base de données")
        print("3. Lancez 'marketplace seed' pour ajouter des données de test")
        print("4. Lancez 'marketplace run' pour démarrer l'application")
    
    def run(self, service="all"):
        """Lance le backend et/ou le frontend"""
        if service in ["backend", "all"]:
            print("🚀 Lancement du backend...")
            self._run_backend()
        
        if service in ["frontend", "all"]:
            print("🚀 Lancement du frontend...")
            self._run_frontend()
    
    def _run_backend(self):
        """Lance le serveur backend"""
        os.chdir(self.backend_dir)
        try:
            print("📡 Backend disponible sur http://localhost:8000")
            print("📚 Documentation API : http://localhost:8000/docs")
            subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--reload"])
        except KeyboardInterrupt:
            print("\n⏹️  Backend arrêté")
    
    def _run_frontend(self):
        """Lance le serveur frontend"""
        os.chdir(self.frontend_dir)
        try:
            print("🌐 Frontend disponible sur http://localhost:5173")
            subprocess.run(["npm", "run", "dev"])
        except KeyboardInterrupt:
            print("\n⏹️  Frontend arrêté")
    
    def migrate(self):
        """Gère les migrations de base de données"""
        print("🔄 Création des tables de base de données...")
        os.chdir(self.backend_dir)
        
        try:
            # Créer les tables via SQLAlchemy
            subprocess.run([
                sys.executable, "-c",
                "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Tables créées avec succès')"
            ])
        except Exception as e:
            print(f"❌ Erreur lors de la migration : {e}")
    
    def seed(self):
        """Ajoute des données de test"""
        print("🌱 Ajout de données de test...")
        
        seed_script = """
import sys
sys.path.insert(0, '.')
from app.core.database import SessionLocal
from app.models import User, Product, ProductCategory, ProductCondition, UserRole
from app.core.security import get_password_hash

db = SessionLocal()

# Créer un admin
admin = User(
    email="admin@marketplace.com",
    hashed_password=get_password_hash("admin123"),
    first_name="Admin",
    last_name="Marketplace",
    role=UserRole.ADMIN
)
db.add(admin)

# Créer un vendeur
vendeur = User(
    email="vendeur@marketplace.com",
    hashed_password=get_password_hash("vendeur123"),
    first_name="Jean",
    last_name="Vendeur",
    role=UserRole.VENDEUR
)
db.add(vendeur)

# Créer un client
client = User(
    email="client@marketplace.com",
    hashed_password=get_password_hash("client123"),
    first_name="Marie",
    last_name="Cliente",
    role=UserRole.CLIENT
)
db.add(client)

db.commit()
db.refresh(vendeur)

# Créer quelques produits
products = [
    Product(
        name="iPhone 12 Pro",
        brand="Apple",
        category=ProductCategory.SMARTPHONE,
        condition=ProductCondition.EXCELLENT,
        price=699.99,
        stock=10,
        description="iPhone 12 Pro reconditionné en excellent état",
        seller_id=vendeur.id
    ),
    Product(
        name="MacBook Pro 13",
        brand="Apple",
        category=ProductCategory.ORDINATEUR,
        condition=ProductCondition.BON,
        price=1299.99,
        stock=5,
        description="MacBook Pro 13 pouces reconditionné",
        seller_id=vendeur.id
    ),
    Product(
        name="iPad Air",
        brand="Apple",
        category=ProductCategory.TABLETTE,
        condition=ProductCondition.EXCELLENT,
        price=449.99,
        stock=15,
        description="iPad Air reconditionné comme neuf",
        seller_id=vendeur.id
    )
]

for product in products:
    db.add(product)

db.commit()
db.close()

print("✅ Données de test ajoutées avec succès")
print("\\n📧 Comptes créés :")
print("Admin : admin@marketplace.com / admin123")
print("Vendeur : vendeur@marketplace.com / vendeur123")
print("Client : client@marketplace.com / client123")
"""
        
        os.chdir(self.backend_dir)
        try:
            subprocess.run([sys.executable, "-c", seed_script])
        except Exception as e:
            print(f"❌ Erreur lors du seed : {e}")
    
    def help(self):
        """Affiche l'aide"""
        help_text = """
╔═══════════════════════════════════════════════════════════╗
║        🛒 MARKETPLACE CLI - Aide                          ║
╚═══════════════════════════════════════════════════════════╝

Commandes disponibles :

  marketplace init
      Initialise le projet (crée le fichier .env)

  marketplace run [service]
      Lance l'application
      - service : backend | frontend | all (défaut: all)
      
  marketplace migrate
      Crée les tables de la base de données
      
  marketplace seed
      Ajoute des données de test
      
  marketplace help
      Affiche cette aide

Exemples :
  marketplace init
  marketplace migrate
  marketplace seed
  marketplace run backend
  marketplace run frontend
  marketplace run

Pour plus d'informations : https://github.com/votre-repo
"""
        print(help_text)


def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(
        description="Outil CLI pour la gestion du projet Marketplace",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "command",
        choices=["init", "run", "migrate", "seed", "help"],
        help="Commande à exécuter"
    )
    
    parser.add_argument(
        "service",
        nargs="?",
        default="all",
        choices=["backend", "frontend", "all"],
        help="Service à lancer (pour la commande run)"
    )
    
    args = parser.parse_args()
    
    cli = MarketplaceCLI()
    
    if args.command == "init":
        cli.init()
    elif args.command == "run":
        cli.run(args.service)
    elif args.command == "migrate":
        cli.migrate()
    elif args.command == "seed":
        cli.seed()
    elif args.command == "help":
        cli.help()


if __name__ == "__main__":
    main()
