# Configuration des tokens JWT

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` (à la racine du projet, parent du dossier `app`) :

```env
# Configuration JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=24h

# Configuration existante
PEPPER=your-pepper-value
```

### Explications :

- **JWT_SECRET** : Clé secrète utilisée pour signer les tokens JWT. 
  - ⚠️ **IMPORTANT** : Changez cette valeur en production avec une clé sécurisée et longue
  - Exemple sécurisé : utilisez `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- **JWT_EXPIRATION** : Durée de validité du token
  - Format accepté : `7d` (7 jours), `24h` (24 heures), `3600` (secondes)
  - Valeur par défaut : `24h`

## Fonctionnement du flux JWT

### 1. **Inscription et Connexion**
- L'utilisateur s'inscrit ou se connecte
- Le serveur génère un token JWT contenant :
  - ID de l'utilisateur
  - Nom d'utilisateur
  - Email
  - Rôle
  - Timestamp d'expiration
- Le token est retourné au client

### 2. **Stockage du Token**
- Le client stocke le token dans `localStorage`
- Le token est envoyé à chaque requête authentifiée dans le header `Authorization: Bearer <token>`

### 3. **Vérification du Token**
- Le middleware d'authentification vérifie le token sur chaque requête protégée
- Si le token est valide, l'utilisateur est autorisé
- Si le token est expiré ou invalide, la requête est rejetée avec un code 401

## Routes protégeant par le JWT

### Routes nécessitant une authentification :
- `GET /api/profile` - Récupérer le profil
- `POST /api/profile` - Mettre à jour le profil
- `POST /api/profile/photo` - Uploader une photo

### Routes publiques (sans authentification) :
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/register` - S'inscrire

## Utilisation côté client

Utilisez la fonction `apiCall()` du fichier `public/js/api.js` pour faire des requêtes authentifiées :

```javascript
// Récupérer le profil (requête authentifiée)
const response = await apiCall('/api/profile', {
    method: 'GET'
});

// Mettre à jour le profil
const response = await apiCall('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: 'New address' })
});
```

## Sécurité

- Les tokens JWT ne doivent jamais être stockés dans les cookies non sécurisés en production
- Utilisez HTTPS pour tous les échanges de tokens
- Changez `JWT_SECRET` en production
- Définissez une durée d'expiration appropriée pour vos besoins
- Implémentez un système de refresh token pour les sessions longues
