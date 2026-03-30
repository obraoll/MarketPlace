#!/bin/bash

echo "========================================"
echo "  MARKETPLACE - Installation Automatique"
echo "========================================"
echo ""

echo "[1/5] Création de la base de données..."
psql -U postgres -c "CREATE DATABASE marketplace_db;" 2>/dev/null
psql -U postgres -c "CREATE USER marketplace_user WITH PASSWORD 'password123';" 2>/dev/null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;" 2>/dev/null
echo "Done!"
echo ""

echo "[2/5] Installation du backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt > /dev/null
cat > .env << EOF
DATABASE_URL=postgresql://marketplace_user:password123@localhost:5432/marketplace_db
SECRET_KEY=dev-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:5173
EOF
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
cd ..
echo "Done!"
echo ""

echo "[3/5] Installation du frontend..."
cd frontend
npm install > /dev/null
cd ..
echo "Done!"
echo ""

echo "[4/5] Ajout des données de test..."
cd cli
python3 marketplace_cli.py seed
cd ..
echo "Done!"
echo ""

echo "========================================"
echo "  Installation terminée !"
echo "========================================"
echo ""
echo "Pour lancer l'application :"
echo "  cd cli"
echo "  python3 marketplace_cli.py run"
echo ""
echo "Ou manuellement :"
echo "  Terminal 1 : cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Terminal 2 : cd frontend && npm run dev"
echo ""
echo "Accès :"
echo "  - Frontend : http://localhost:5173"
echo "  - API      : http://localhost:8000"
echo "  - Docs     : http://localhost:8000/docs"
echo ""
