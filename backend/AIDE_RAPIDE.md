# 🆘 Aide Rapide - MySQL n'est pas reconnu

## ❌ Problème

```
mysql : Le terme «mysql» n'est pas reconnu...
```

---

## ✅ Solution la Plus Rapide (1 commande)

### Option 1 : Script Batch (.bat)

```powershell
.\setup_mysql_sans_path.bat
```

### Option 2 : Script PowerShell (.ps1)

```powershell
.\Setup-MySQL.ps1
```

**Ces scripts font TOUT automatiquement :**
- ✅ Trouvent MySQL
- ✅ Créent la base de données
- ✅ Configurent le projet
- ✅ Ajoutent les données de test

---

## 🔧 Autres Solutions

### Si vous voulez juste savoir où est MySQL

```powershell
.\verifier_mysql.bat
```

### Si vous voulez ajouter MySQL au PATH

1. Lancez `.\verifier_mysql.bat`
2. Suivez les instructions affichées
3. Redémarrez PowerShell

---

## 📋 Emplacements Communs de MySQL

**MySQL standard :**
```
C:\Program Files\MySQL\MySQL Server 8.0\bin\
```

**XAMPP :**
```
C:\xampp\mysql\bin\
```

**WAMP :**
```
C:\wamp64\bin\mysql\mysql8.0.27\bin\
```

---

## 🚀 Après la Configuration

### Lancer le backend

```powershell
uvicorn app.main:app --reload
```

### Lancer le frontend

```powershell
cd ..\frontend
npm run dev
```

---

## 📚 Documentation Complète

- `SOLUTION_MYSQL_PATH.md` - Guide détaillé
- `CONFIGURATION_MYSQL_RAPIDE.md` - Configuration complète
- `MYSQL_CONFIGURATION_COMPLETE.md` - Récapitulatif

---

## 🎯 En Résumé

**UN SEUL SCRIPT À LANCER :**

```powershell
.\setup_mysql_sans_path.bat
```

**C'est tout ! 🎉**
