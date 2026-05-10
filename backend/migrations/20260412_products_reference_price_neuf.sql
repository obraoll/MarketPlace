-- Prix public neuf (optionnel) pour affichage barré / économie sur la fiche produit.
-- Idempotent : ne fait rien si la colonne existe déjà.
-- phpMyAdmin : onglet SQL, coller tout le fichier puis Exécuter.

SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'reference_price_neuf'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE products ADD COLUMN reference_price_neuf FLOAT NULL COMMENT ''Prix neuf de référence (barré)'' AFTER price',
  'SELECT ''Colonne reference_price_neuf déjà présente'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
