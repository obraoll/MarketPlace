"""
Affiche quelle base MySQL/SQLite est lue via DATABASE_URL (backend/.env) et combien d'enregistrements il y a.

Usage (dossier backend, venv activé) :

    python verifier_donnees_locale.py

Si le compte ne correspond pas à ce que vous voyez dans phpMyAdmin :
  - le nom de la base dans DATABASE_URL doit être le MÊME que la base où sont vos tables ;
  - ou vous avez deux serveurs MySQL (ex. XAMPP + service Windows) : l'app suit .env.
"""
from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.database import SessionLocal, engine
from app.models import Product, User


def main() -> None:
    u = make_url(settings.DATABASE_URL)
    print("=== Configuration lue dans backend/.env ===")
    print(f"  Driver : {u.drivername}")
    print(f"  Hôte   : {u.host or '(sqlite ou fichier)'}")
    print(f"  Base   : {u.database or '(sqlite)'}")
    print(f"  User   : {u.username or '-'}")
    print()

    with engine.connect() as conn:
        row = conn.execute(text("SELECT DATABASE()")).scalar()
    print(f"Base réellement sélectionnée après connexion : {row!r}")
    print()

    db = SessionLocal()
    try:
        n_prod = db.query(Product).count()
        n_active = db.query(Product).filter(Product.is_active.is_(True)).count()
        n_users = db.query(User).count()
        print("=== Contenu vu par l'application ===")
        print(f"  Produits (total)     : {n_prod}")
        print(f"  Produits is_active=1 : {n_active}")
        print(f"  Utilisateurs         : {n_users}")
        if n_prod and n_active == 0:
            print()
            print("  (!) Tous les produits sont inactifs : ils n'apparaîtront pas sur le site.")
    finally:
        db.close()

    print()
    print("Si ces chiffres sont à 0 mais pas dans phpMyAdmin :")
    print("  1) Ouvrez phpMyAdmin et notez le NOM EXACT de la base (colonne de gauche).")
    print("  2) Dans backend/.env, DATABASE_URL=.../CE_NOM/...")
    print("  3) Redémarrez uvicorn.")


if __name__ == "__main__":
    main()
