-- Aligne la table products avec app/models/product.py (colonnes absentes sur anciennes bases MySQL).
-- Exécuter dans phpMyAdmin (SQL) ou : mysql -u ... marketplace_db < ce fichier

ALTER TABLE products
  ADD COLUMN image_urls TEXT NULL COMMENT 'JSON: liste d''URLs d''images' AFTER image_url,
  ADD COLUMN variants TEXT NULL COMMENT 'JSON: variantes produit' AFTER image_urls,
  ADD COLUMN badge VARCHAR(50) NULL AFTER variants;
