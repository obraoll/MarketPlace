# ⚠️ Solution : MySQL n'est pas dans le PATH

## 🔍 Le Problème

Vous avez cette erreur :
```
mysql : Le terme «mysql» n'est pas reconnu comme nom d'applet de commande
```

Cela signifie que MySQL n'est pas dans le PATH de Windows, même s'il est installé.

---

## ✅ Solutions (3 options)

### 🚀 Option 1 : Script Automatique (RECOMMANDÉ - LE PLUS FACILE)

Utilisez le script qui détecte automatiquement MySQL :

```powershell
cd C:\Users\smith\marketplace\backend
.\setup_mysql_sans_path.bat
```

**Ce script va :**
- ✅ Trouver MySQL automatiquement sur votre ordinateur
- ✅ Créer la base de données
- ✅ Configurer tout le projet
- ✅ **Aucune manipulation manuelle requise !**

---

### 🔧 Option 2 : Ajouter MySQL au PATH (Solution permanente)

#### Étape 1 : Trouver l'emplacement de MySQL

Exécutez ce script pour trouver MySQL :

```powershell
.\verifier_mysql.bat
```

#### Étape 2 : Ajouter au PATH

**Le script vous donnera le chemin exact.** Ensuite :

1. Appuyez sur `Win + R`
2. Tapez `sysdm.cpl` et appuyez sur Entrée
3. Onglet **"Paramètres système avancés"**
4. Cliquez sur **"Variables d'environnement"**
5. Dans **"Variables système"**, sélectionnez **"Path"**
6. Cliquez sur **"Modifier"**
7. Cliquez sur **"Nouveau"**
8. Collez le chemin donné par le script (exemple : `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
9. Cliquez sur **OK** partout
10. **REDÉMARREZ PowerShell** (important !)

#### Étape 3 : Vérifier

Ouvrez un **NOUVEAU** PowerShell et testez :

```powershell
mysql --version
```

Vous devriez voir la version de MySQL.

#### Étape 4 : Configurer le projet

```powershell
cd C:\Users\smith\marketplace\backend
.\configure_mysql.bat
```

---

### 🎯 Option 3 : Utiliser le Chemin Complet (Solution rapide)

Si vous connaissez l'emplacement de MySQL, utilisez le chemin complet.

#### Emplacements communs :

**MySQL standard :**
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --version
```

**XAMPP :**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" --version
```

**WAMP :**
```powershell
& "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe" --version
```

**Laragon :**
```powershell
& "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" --version
```

#### Créer la base de données avec le chemin complet :

**MySQL standard :**
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

**XAMPP (souvent sans mot de passe) :**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root
```

Puis dans MySQL :
```sql
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🆘 MySQL n'est pas installé ?

### Installation de MySQL

#### Option A : MySQL Community Server (Officiel)

1. Téléchargez : https://dev.mysql.com/downloads/installer/
2. Choisissez **"mysql-installer-web-community"**
3. Exécutez l'installeur
4. Sélectionnez **"Server only"** ou **"Developer Default"**
5. Définissez un mot de passe root
6. **Important :** Cochez "Add MySQL to PATH" pendant l'installation

#### Option B : XAMPP (Plus simple, inclut phpMyAdmin)

1. Téléchargez : https://www.apachefriends.org/
2. Installez XAMPP
3. Ouvrez le panneau de contrôle XAMPP
4. Cliquez sur **"Start"** à côté de MySQL
5. Utilisez `C:\xampp\mysql\bin\mysql.exe`

#### Option C : Docker (Pour développeurs)

```powershell
docker run --name mysql-marketplace `
  -e MYSQL_ROOT_PASSWORD=rootpassword `
  -e MYSQL_DATABASE=marketplace_db `
  -e MYSQL_USER=marketplace_user `
  -e MYSQL_PASSWORD=password123 `
  -p 3306:3306 `
  -d mysql:8.0
```

---

## 📊 Vérifier que MySQL fonctionne

### Vérifier le service Windows

1. Appuyez sur `Win + R`
2. Tapez `services.msc`
3. Cherchez **"MySQL"** ou **"MySQL80"**
4. Statut devrait être **"En cours d'exécution"**
5. Si non, clic droit → **"Démarrer"**

### XAMPP/WAMP

Ouvrez le panneau de contrôle et cliquez sur **"Start"** pour MySQL.

---

## 🎯 Workflow Recommandé (Étapes Complètes)

### 1. Vérifier MySQL
```powershell
cd C:\Users\smith\marketplace\backend
.\verifier_mysql.bat
```

### 2. Configurer automatiquement
```powershell
.\setup_mysql_sans_path.bat
```

### 3. Tester la connexion
```powershell
venv\Scripts\activate
python test_mysql_connection.py
```

### 4. Lancer l'application
```powershell
# Terminal 1 - Backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd ..\frontend
npm install
npm run dev
```

---

## 🐛 Problèmes Courants

### ❌ "Access denied for user 'root'@'localhost'"

**XAMPP :** Le mot de passe root est vide par défaut

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root
```

**MySQL standard :** Utilisez le mot de passe défini lors de l'installation

```powershell
mysql -u root -p
```

### ❌ "Can't connect to MySQL server on 'localhost'"

**Solution :** MySQL n'est pas démarré

- **Windows Services :** `services.msc` → MySQL → Démarrer
- **XAMPP :** Panneau XAMPP → MySQL → Start
- **WAMP :** Icône WAMP → MySQL → Start

### ❌ Le script trouve plusieurs versions de MySQL

Utilisez la version la plus récente (8.0+)

---

## 📝 Après la Configuration

Une fois MySQL configuré avec succès :

### Lancer le backend
```powershell
cd C:\Users\smith\marketplace\backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Lancer le frontend
```powershell
cd C:\Users\smith\marketplace\frontend
npm run dev
```

### Accéder à l'application
- Frontend : http://localhost:5173
- API : http://localhost:8000
- Docs : http://localhost:8000/docs

---

## 🎉 Résumé

**La solution la plus simple :**

```powershell
cd C:\Users\smith\marketplace\backend
.\setup_mysql_sans_path.bat
```

Ce script fait tout automatiquement ! 🚀

---

## 📚 Fichiers d'Aide Créés

| Fichier | Description |
|---------|-------------|
| `verifier_mysql.bat` | Trouve MySQL sur votre PC |
| `setup_mysql_sans_path.bat` | Configure tout automatiquement |
| `SOLUTION_MYSQL_PATH.md` | Ce guide |

---

**Besoin d'aide ?** Lancez `verifier_mysql.bat` pour diagnostiquer le problème !
