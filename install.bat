@echo off
echo ========================================
echo   MARKETPLACE - Installation Automatique
echo ========================================
echo.

echo [1/5] Creation de la base de donnees...
psql -U postgres -c "CREATE DATABASE marketplace_db;" 2>nul
psql -U postgres -c "CREATE USER marketplace_user WITH PASSWORD 'password123';" 2>nul
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;" 2>nul
echo Done!
echo.

echo [2/5] Installation du backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt > nul
echo DATABASE_URL=postgresql://marketplace_user:password123@localhost:5432/marketplace_db > .env
echo SECRET_KEY=dev-secret-key-change-in-production >> .env
echo ALLOWED_ORIGINS=http://localhost:5173 >> .env
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
cd ..
echo Done!
echo.

echo [3/5] Installation du frontend...
cd frontend
call npm install > nul
cd ..
echo Done!
echo.

echo [4/5] Ajout des donnees de test...
cd cli
python marketplace_cli.py seed
cd ..
echo Done!
echo.

echo ========================================
echo   Installation terminee !
echo ========================================
echo.
echo Pour lancer l'application :
echo   cd cli
echo   python marketplace_cli.py run
echo.
echo Ou manuellement :
echo   Terminal 1 : cd backend ^& venv\Scripts\activate ^& uvicorn app.main:app --reload
echo   Terminal 2 : cd frontend ^& npm run dev
echo.
echo Acces :
echo   - Frontend : http://localhost:5173
echo   - API      : http://localhost:8000
echo   - Docs     : http://localhost:8000/docs
echo.
pause
