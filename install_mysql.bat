@echo off
echo ========================================
echo   MARKETPLACE - Installation MySQL
echo ========================================
echo.

echo [1/5] Creation de la base de donnees MySQL...
echo.
echo Entrez le mot de passe root de MySQL :
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'marketplace_user'@'localhost' IDENTIFIED BY 'password123'; GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost'; FLUSH PRIVILEGES;"
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR : Impossible de creer la base de donnees
    echo Verifiez que MySQL est lance et que le mot de passe est correct
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/5] Installation du backend...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
echo DATABASE_URL=mysql+pymysql://marketplace_user:password123@localhost:3306/marketplace_db > .env
echo SECRET_KEY=dev-secret-key-change-in-production >> .env
echo ALLOWED_ORIGINS=http://localhost:5173 >> .env
echo ALGORITHM=HS256 >> .env
echo ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('Tables creees avec succes')"
cd ..
echo Done!
echo.

echo [3/5] Installation du frontend...
cd frontend
call npm install
cd ..
echo Done!
echo.

echo [4/5] Ajout des donnees de test...
cd backend
call venv\Scripts\activate
python -c "import sys; sys.path.insert(0, '.'); from app.core.database import SessionLocal; from app.models import User, Product, ProductCategory, ProductCondition, UserRole; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(email='admin@marketplace.com', hashed_password=get_password_hash('admin123'), first_name='Admin', last_name='Marketplace', role=UserRole.ADMIN); vendeur = User(email='vendeur@marketplace.com', hashed_password=get_password_hash('vendeur123'), first_name='Jean', last_name='Vendeur', role=UserRole.VENDEUR); client = User(email='client@marketplace.com', hashed_password=get_password_hash('client123'), first_name='Marie', last_name='Cliente', role=UserRole.CLIENT); db.add(admin); db.add(vendeur); db.add(client); db.commit(); db.refresh(vendeur); products = [Product(name='iPhone 12 Pro', brand='Apple', category=ProductCategory.SMARTPHONE, condition=ProductCondition.EXCELLENT, price=699.99, stock=10, description='iPhone 12 Pro reconditionne en excellent etat', seller_id=vendeur.id), Product(name='MacBook Pro 13', brand='Apple', category=ProductCategory.ORDINATEUR, condition=ProductCondition.BON, price=1299.99, stock=5, description='MacBook Pro 13 pouces reconditionne', seller_id=vendeur.id), Product(name='iPad Air', brand='Apple', category=ProductCategory.TABLETTE, condition=ProductCondition.EXCELLENT, price=449.99, stock=15, description='iPad Air reconditionne comme neuf', seller_id=vendeur.id)]; [db.add(p) for p in products]; db.commit(); db.close(); print('Donnees de test ajoutees avec succes')"
cd ..
echo Done!
echo.

echo ========================================
echo   Installation terminee !
echo ========================================
echo.
echo Comptes de test :
echo   Admin    : admin@marketplace.com / admin123
echo   Vendeur  : vendeur@marketplace.com / vendeur123
echo   Client   : client@marketplace.com / client123
echo.
echo Pour lancer l'application :
echo   Terminal 1 : cd backend ^& venv\Scripts\activate ^& uvicorn app.main:app --reload
echo   Terminal 2 : cd frontend ^& npm run dev
echo.
echo Acces :
echo   - Frontend : http://localhost:5173
echo   - API      : http://localhost:8000
echo   - Docs     : http://localhost:8000/docs
echo.
pause
