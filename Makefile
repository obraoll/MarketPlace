# Makefile pour Marketplace

.PHONY: help install dev test clean docker-up docker-down

help:
	@echo "Marketplace - Commandes disponibles:"
	@echo ""
	@echo "  make install       - Installer les dépendances"
	@echo "  make dev           - Lancer en mode développement"
	@echo "  make test          - Lancer les tests"
	@echo "  make lint          - Vérifier la qualité du code"
	@echo "  make clean         - Nettoyer les fichiers temporaires"
	@echo "  make docker-up     - Lancer avec Docker Compose"
	@echo "  make docker-down   - Arrêter Docker Compose"
	@echo ""

install:
	@echo "📦 Installation des dépendances..."
	cd backend && python -m venv venv && ./venv/Scripts/activate && pip install -r requirements.txt
	cd frontend && npm install

dev:
	@echo "🚀 Lancement en mode développement..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
	start cmd /k "cd frontend && npm run dev"

test:
	@echo "🧪 Lancement des tests..."
	cd backend && venv\Scripts\activate && pytest --cov=app tests/

test-verbose:
	@echo "🧪 Lancement des tests (mode verbose)..."
	cd backend && venv\Scripts\activate && pytest -v --cov=app --cov-report=html tests/

lint:
	@echo "🔍 Vérification de la qualité du code..."
	cd backend && venv\Scripts\activate && flake8 app/ && black --check app/
	cd frontend && npm run lint

format:
	@echo "✨ Formatage du code..."
	cd backend && venv\Scripts\activate && black app/
	cd frontend && npm run format

clean:
	@echo "🧹 Nettoyage..."
	@if exist "backend\__pycache__" rmdir /s /q backend\__pycache__
	@if exist "backend\.pytest_cache" rmdir /s /q backend\.pytest_cache
	@if exist "backend\htmlcov" rmdir /s /q backend\htmlcov
	@if exist "frontend\dist" rmdir /s /q frontend\dist
	@if exist "frontend\node_modules" rmdir /s /q frontend\node_modules

docker-up:
	@echo "🐳 Démarrage avec Docker Compose..."
	docker-compose up -d
	@echo "✅ Services démarrés!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"

docker-down:
	@echo "🛑 Arrêt de Docker Compose..."
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-rebuild:
	@echo "🔨 Reconstruction des images Docker..."
	docker-compose build --no-cache
	docker-compose up -d
