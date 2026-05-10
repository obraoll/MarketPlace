"""
Ajoute la colonne products.reference_price_neuf si elle est absente.
À lancer depuis le dossier backend (venv activé) :

    python add_reference_price_neuf_column.py

Sans cette colonne, MySQL renvoie une erreur et la liste des produits reste vide.
"""
from sqlalchemy import inspect, text

from app.core.database import engine


def main() -> None:
    insp = inspect(engine)
    try:
        cols = {c["name"] for c in insp.get_columns("products")}
    except Exception as e:
        print(f"Impossible de lire la table products : {e}")
        raise SystemExit(1) from e

    if "reference_price_neuf" in cols:
        print("OK : la colonne reference_price_neuf existe déjà.")
        return

    dialect = engine.dialect.name
    if dialect not in ("mysql", "mariadb"):
        print(f"Dialecte {dialect} : ajoutez la colonne manuellement si nécessaire (FLOAT NULL).")
        raise SystemExit(1)

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE products ADD COLUMN reference_price_neuf FLOAT NULL "
                "COMMENT 'Prix neuf de référence (barré)' AFTER price"
            )
        )
    print("Colonne reference_price_neuf ajoutée. Redémarrez uvicorn si besoin.")


if __name__ == "__main__":
    main()
