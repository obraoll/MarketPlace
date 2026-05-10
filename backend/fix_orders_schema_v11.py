"""
Mise à niveau locale de la table `orders` vers le schéma v1.1+ (idempotent).

Corrige l'erreur:
  (1054, "Champ 'subtotal_amount' inconnu dans field list")

Usage:
  cd backend
  .\\venv\\Scripts\\python.exe fix_orders_schema_v11.py
"""
from sqlalchemy import inspect, text

from app.core.database import engine


def col_exists(insp, table: str, col: str) -> bool:
    return any(c["name"] == col for c in insp.get_columns(table))


def add_column_if_missing(conn, insp, table: str, col: str, ddl: str) -> None:
    if col_exists(insp, table, col):
        print(f"OK: {table}.{col} existe déjà")
        return
    print(f"ADD: {table}.{col}")
    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {ddl}"))


def index_exists(insp, table: str, idx_name: str) -> bool:
    return any(i.get("name") == idx_name for i in insp.get_indexes(table))


def main() -> None:
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    if "orders" not in tables:
        print("ERREUR: table `orders` introuvable.")
        raise SystemExit(1)

    with engine.begin() as conn:
        # Recharger inspecteur après chaque DDL
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "subtotal_amount", "FLOAT NOT NULL DEFAULT 0.0")
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "discount_amount", "FLOAT NOT NULL DEFAULT 0.0")
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "shipping_amount", "FLOAT NOT NULL DEFAULT 0.0")
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "platform_fee_amount", "FLOAT NOT NULL DEFAULT 0.0")
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "promo_code", "VARCHAR(50) NULL")
        insp = inspect(engine)
        add_column_if_missing(conn, insp, "orders", "seller_id", "INTEGER NULL")
        insp = inspect(engine)
        if not index_exists(insp, "orders", "ix_orders_seller_id"):
            print("ADD INDEX: ix_orders_seller_id")
            conn.execute(text("CREATE INDEX ix_orders_seller_id ON orders (seller_id)"))
        else:
            print("OK: index ix_orders_seller_id existe déjà")

        # Backfill minimal pour cohérence comptable
        conn.execute(
            text(
                "UPDATE orders "
                "SET subtotal_amount = total_amount "
                "WHERE subtotal_amount IS NULL OR subtotal_amount = 0"
            )
        )

    print("Migration orders terminée.")


if __name__ == "__main__":
    main()

