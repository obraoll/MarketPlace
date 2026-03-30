-- Script SQL pour configurer MySQL pour le projet Marketplace
-- Exécutez ce script avec : mysql -u root -p < setup_mysql.sql

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS marketplace_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur
CREATE USER IF NOT EXISTS 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Afficher les informations
SELECT 'Base de données et utilisateur créés avec succès !' AS status;
SELECT CONCAT('Base de données: ', DATABASE()) AS info;

-- Utiliser la base de données
USE marketplace_db;

-- Afficher les tables (vide au début)
SHOW TABLES;
