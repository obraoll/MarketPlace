# 🔄 Guide de Migration - Version 1.0 → 1.1

Ce guide explique comment migrer votre base de données existante vers la nouvelle version.

---

## ⚠️ CHANGEMENTS DE SCHÉMA

### Modifications dans la table `users`

```sql
-- Avant
is_active VARCHAR(20) DEFAULT 'true'

-- Après  
is_active BOOLEAN DEFAULT TRUE
is_blocked BOOLEAN DEFAULT FALSE  -- NOUVEAU CHAMP
```

### Modifications dans la table `products`

```sql
-- Avant
is_active VARCHAR(20) DEFAULT 'true'

-- Après
is_active BOOLEAN DEFAULT TRUE
```

---

## 🎯 DEUX OPTIONS DE MIGRATION

### Option 1 : Recréation Complète (Simple, perd les données)

**⚠️ Attention : Toutes les données seront perdues !**

```powershell
# 1. Sauvegarder les données (si nécessaire)
mysqldump -u marketplace_user -p marketplace_db > backup_v1.0.sql

# 2. Supprimer et recréer la base
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root -e "DROP DATABASE marketplace_db; CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Créer les nouvelles tables
cd C:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
$env:PYTHONIOENCODING="utf-8"
python init_mysql_database.py
```

**✅ Avantages :**
- Simple et rapide
- Pas de risque d'erreur

**❌ Inconvénients :**
- Perte de toutes les données

---

### Option 2 : Migration SQL (Avancé, préserve les données)

**✅ Préserve vos données existantes**

#### Étape 1 : Créer le script de migration

Créez `backend/migrations/migrate_v1.0_to_v1.1.sql` :

```sql
-- Migration 1.0 → 1.1
-- Convertit is_active de VARCHAR vers BOOLEAN

USE marketplace_db;

-- ============================================
-- Table users
-- ============================================

-- Ajouter le nouveau champ is_blocked
ALTER TABLE users 
ADD COLUMN is_blocked_temp BOOLEAN DEFAULT FALSE AFTER is_active;

-- Créer la nouvelle colonne is_active en boolean
ALTER TABLE users 
ADD COLUMN is_active_new BOOLEAN DEFAULT TRUE AFTER is_blocked_temp;

-- Convertir les données
UPDATE users 
SET is_active_new = CASE 
    WHEN is_active = 'true' THEN TRUE
    WHEN is_active = 'blocked' THEN FALSE  -- blocked → is_active=FALSE + is_blocked=TRUE
    ELSE FALSE
END;

UPDATE users 
SET is_blocked_temp = CASE 
    WHEN is_active = 'blocked' THEN TRUE
    ELSE FALSE
END;

-- Supprimer l'ancienne colonne
ALTER TABLE users DROP COLUMN is_active;

-- Renommer les nouvelles colonnes
ALTER TABLE users CHANGE is_active_new is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE users CHANGE is_blocked_temp is_blocked BOOLEAN DEFAULT FALSE NOT NULL;

-- ============================================
-- Table products
-- ============================================

-- Créer la nouvelle colonne
ALTER TABLE products 
ADD COLUMN is_active_new BOOLEAN DEFAULT TRUE;

-- Convertir les données
UPDATE products 
SET is_active_new = CASE 
    WHEN is_active = 'true' THEN TRUE
    ELSE FALSE
END;

-- Supprimer l'ancienne colonne
ALTER TABLE products DROP COLUMN is_active;

-- Renommer
ALTER TABLE products CHANGE is_active_new is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- ============================================
-- Vérifications
-- ============================================

-- Afficher les nouveaux schémas
DESCRIBE users;
DESCRIBE products;

-- Compter les enregistrements
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;

SELECT 'Migration 1.0 → 1.1 terminée avec succès !' AS status;
```

#### Étape 2 : Sauvegarder la base actuelle

```powershell
# Backup complet
mysqldump -u marketplace_user -p marketplace_db > backup_before_migration_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

#### Étape 3 : Exécuter la migration

```powershell
# Exécuter le script SQL
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u marketplace_user -p < backend/migrations/migrate_v1.0_to_v1.1.sql
```

#### Étape 4 : Vérifier

```powershell
# Tester la connexion
cd backend
python test_mysql_connection.py

# Vérifier que le backend démarre
uvicorn app.main:app --reload
```

**✅ Avantages :**
- Données préservées
- Migration contrôlée

**❌ Inconvénients :**
- Plus complexe
- Risque d'erreur SQL

---

## 🧪 APRÈS LA MIGRATION

### Vérifier le Schéma

```sql
-- Connecter à MySQL
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u marketplace_user -p marketplace_db

-- Vérifier les schémas
DESCRIBE users;
DESCRIBE products;

-- Vérifier les données
SELECT id, email, is_active, is_blocked FROM users;
SELECT id, name, is_active FROM products LIMIT 5;
```

**Résultat attendu users :**
```
+------------+--------------+------+-----+---------+
| Field      | Type         | Null | Key | Default |
+------------+--------------+------+-----+---------+
| is_active  | tinyint(1)   | NO   |     | 1       |  ✅ Boolean
| is_blocked | tinyint(1)   | NO   |     | 0       |  ✅ Boolean
+------------+--------------+------+-----+---------+
```

**Résultat attendu products :**
```
+-----------+--------------+------+-----+---------+
| Field     | Type         | Null | Key | Default |
+-----------+--------------+------+-----+---------+
| is_active | tinyint(1)   | NO   |     | 1       |  ✅ Boolean
+-----------+--------------+------+-----+---------+
```

---

### Tester l'Application

```powershell
# Backend
cd backend
.\venv\Scripts\Activate.ps1
$env:PYTHONIOENCODING="utf-8"
uvicorn app.main:app --reload

# Dans un autre terminal - Frontend
cd frontend
npm run dev
```

**Tests fonctionnels :**
1. ✅ Connexion avec admin@marketplace.com / admin123
2. ✅ Liste des produits affichée
3. ✅ Ajout au panier fonctionne
4. ✅ Dashboard vendeur accessible

---

## 🔄 ROLLBACK (En cas de problème)

Si la migration échoue, restaurez la sauvegarde :

```powershell
# Restaurer la sauvegarde
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u marketplace_user -p marketplace_db < backup_before_migration_XXXXXXXX.sql
```

---

## 📊 CHECKLIST MIGRATION

### Avant Migration
- [ ] Sauvegarde base de données créée
- [ ] WampServer lancé (icône verte)
- [ ] Nouvelles dépendances installées
- [ ] Fichiers sources sauvegardés (git commit)

### Pendant Migration
- [ ] Option choisie (1 ou 2)
- [ ] Script exécuté sans erreur
- [ ] Schémas vérifiés (DESCRIBE tables)
- [ ] Données présentes (SELECT COUNT)

### Après Migration
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Tests passent (pytest)
- [ ] Connexion fonctionne
- [ ] Produits s'affichent
- [ ] Toutes les fonctionnalités OK

---

## 🆘 PROBLÈMES FRÉQUENTS

### "Column 'is_blocked' doesn't exist"

**Cause :** Base pas migrée

**Solution :** Option 1 (recréer) ou Option 2 (migration SQL)

---

### "Unknown column 'is_active' in field list"

**Cause :** Ancienne base avec nouveau code

**Solution :** Recréer la base

---

### Tests échouent après migration

**Cause :** Tests utilisent SQLite en mémoire (pas affecté)

**Solution :** Normal, les tests créent leur propre schéma

---

## ✅ VALIDATION FINALE

Après migration, vérifiez :

```powershell
# 1. Tests
cd backend
pytest --cov=app tests/

# 2. Backend
uvicorn app.main:app --reload
# → Doit démarrer sans erreur

# 3. Connexion
# → Tester la connexion sur http://localhost:5173

# 4. Rate limiting
# → Essayer 6 connexions rapides (6ème bloquée)

# 5. Logs
# → Vérifier format JSON dans le terminal
```

---

## 📞 BESOIN D'AIDE ?

Consultez :
- `AUDIT_RAPPORT.md` - Rapport complet
- `CORRECTIONS_APPLIQUEES.md` - Détails techniques
- `INSTRUCTIONS_FINALES.md` - Actions à faire

---

**🎉 Migration réussie = Projet production-ready !**

Date: 10 Février 2026
