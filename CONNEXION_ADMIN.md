# Connexion en tant qu'admin

## Compte de test
- **Email :** admin@marketplace.com  
- **Mot de passe :** admin123  

## Si la connexion échoue

### 1. Vider le cache du navigateur
- Appuyez sur **Ctrl + Shift + R** (ou Ctrl + F5) sur la page de connexion.
- Ou : F12 → Application → Stockage → Effacer les données du site.

### 2. Réinitialiser les mots de passe (backend)
Dans un terminal, depuis le dossier du projet :

```powershell
cd c:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
python reset_passwords.py
```

Ou double-cliquez sur : `backend\reinitialiser_mots_de_passe.bat`

### 3. Redémarrer le backend
Arrêtez le serveur (Ctrl+C) puis relancez :

```powershell
cd c:\Users\smith\marketplace\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### 4. Réessayer
Allez sur http://localhost:5173/login et connectez-vous avec admin@marketplace.com / admin123.

---

**Vérification :** le fichier `backend\.env` doit contenir une ligne `SECRET_KEY=...` (une valeur fixe). Sans cela, le token peut être refusé après connexion.
