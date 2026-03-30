# Voir la nouvelle interface Admin

Si vous voyez encore **3 onglets** (Statistiques, Utilisateurs, Produits), le navigateur ou Vite utilise une ancienne version en cache.

## À faire

### 1. Arrêter le serveur frontend
Dans le terminal où tourne `npm run dev`, appuyez sur **Ctrl+C**.

### 2. Relancer en vidant le cache Vite
Depuis le dossier `frontend` :

```powershell
npm run dev:refresh
```

(ou manuellement : supprimez le dossier `frontend\node_modules\.vite` s'il existe, puis `npm run dev`)

### 3. Vider le cache du navigateur
- **Ctrl + Shift + R** (ou Ctrl + F5)
- Ou : F12 → Application → Clear storage → Clear site data

### 4. Rouvrir la page Admin
Connectez-vous en admin, puis cliquez sur **Administration**.

Vous devez voir :
- Un **bandeau vert** en haut : *"✓ Interface admin v2 — Vous ne gérez que les vendeurs..."*
- **2 onglets seulement** : **Vue d'ensemble** et **Vendeurs**

Si vous ne voyez pas le bandeau vert, le cache n’est pas encore vidé.
