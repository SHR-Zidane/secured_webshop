# Rapport de sécurité — Secure Shop

**Auteur :** Zidane Sahraoui  
**Classe :** Cid2b  
**Date :** 28 mai 2026  

---

## 6.1 Activités obligatoires

### 1. Page de login (frontend)

**Fichier :** `app/public/js/login.js` et `app/views/login.html`

Un formulaire de connexion a été ajouté. L'utilisateur entre son email et son mot de passe. Quand il clique sur le bouton, le JavaScript envoie une requête `POST` à `/api/auth/login` avec les données. Si le serveur répond OK, le token JWT et les infos de l'utilisateur sont stockés dans le `localStorage` du navigateur, puis l'utilisateur est redirigé vers la page profil.

---

### 2. Page d'inscription (frontend)

**Fichier :** `app/public/js/register.js` et `app/views/register.html`

Un formulaire d'inscription a été ajouté avec les champs nom d'utilisateur, email, mot de passe et confirmation du mot de passe. Le JavaScript valide que les champs sont remplis, que le mot de passe fait au moins 8 caractères et que les deux saisies correspondent. Ensuite il envoie une requête `POST` à `/api/auth/register` et en cas de succès, connecte directement l'utilisateur en stockant son token.

---

### 3. Hash des mots de passe

**Fichier :** `app/controllers/AuthController.js`

Avant, les mots de passe étaient stockés en clair dans la base de données (comme `admin123` dans le fichier SQL). Maintenant, quand un utilisateur s'inscrit, le mot de passe est hashé avec **bcrypt** avant d'être sauvegardé. Bcrypt est un algorithme de hachage lent et sécurisé, conçu spécialement pour les mots de passe. Quand l'utilisateur se connecte, le mot de passe saisi est comparé au hash stocké dans la base.

---

### 4. Ajout d'un sel

Le sel ("salt" en anglais) est une chaîne aléatoire ajoutée au mot de passe avant de le hacher. Cela permet que deux utilisateurs avec le même mot de passe aient des hash différents, ce qui empêche les attaques par tables arc-en-ciel (rainbow tables). Bcrypt inclut automatiquement un sel aléatoire de 22 caractères (10 rounds) dans le hash généré. Le sel est stocké avec le hash dans la base, séparé par un `:`.

**Exemple de stockage :** `$2b$10$sel...:hash...`

---

### 5. Ajout d'un poivre (pepper)

**Fichier :** `app/controllers/AuthController.js` et `.env`

Le poivre ("pepper" en anglais) est une clé secrète stockée côté serveur (dans le fichier `.env` avec la variable `PEPPER`), pas dans la base de données. Avant de hacher le mot de passe avec bcrypt, on applique d'abord un HMAC-SHA512 avec le pepper. Cela signifie que même si un attaquant vole la base de données, il ne peut pas casser les mots de passe sans aussi avoir le pepper qui est sur le serveur.

---

### 6. Protection contre les injections SQL

**Fichiers :** Tous les `controllers/*.js`

Toutes les requêtes SQL utilisent désormais des **requêtes paramétrées** (avec `?` dans la requête et les valeurs passées séparément). Par exemple, au lieu d'écrire `WHERE email = '` + email + `'` (vulnérable), on écrit `WHERE email = ?` et on passe la valeur dans un tableau. MySQL2 échappe automatiquement les valeurs, ce qui empêche un attaquant d'injecter du SQL malveillant via les champs du formulaire.

---

### 7. Token JWT

**Fichier :** `app/controllers/AuthController.js`, `app/middleware/auth.js`

Quand un utilisateur se connecte ou s'inscrit, le serveur génère un **JSON Web Token (JWT)** contenant son id, nom d'utilisateur, email et rôle. Ce token est signé avec une clé secrète (`JWT_SECRET` dans `.env`) et a une durée de validité de 24 heures. Le token est renvoyé au navigateur qui le stocke dans le `localStorage`. Pour chaque requête vers l'API, le token est envoyé dans l'en-tête `Authorization: Bearer <token>`. Le middleware `auth.js` vérifie que le token est valide avant d'autoriser l'accès.

---

### 8. Rôles administrateur/utilisateur dans le JWT

**Fichier :** `app/middleware/auth.js`, `app/middleware/adminAuth.js`, `app/controllers/AdminController.js`

Le JWT contient le champ `role` qui peut être `"user"` ou `"admin"`. La route `/api/admin/users` est protégée par deux middlewares : d'abord `auth` (vérifie que l'utilisateur est connecté), puis `adminAuth` (vérifie que le rôle est `"admin"`). Si un utilisateur normal essaie d'accéder à la page d'administration, il reçoit un message d'erreur et est redirigé. Seul l'utilisateur avec le rôle `"admin"` peut voir la liste de tous les utilisateurs.

---

## 6.2 Activités faciles

### 9. HTTPS

**Fichiers :** `app/server.js`, `app/generate-certs.js`, `app/utils/crypto.js`, `nodejs.dockerfile`, `.gitignore`

Le site fonctionnait uniquement en HTTP (non chiffré). J'ai mis en place le HTTPS avec les étapes suivantes :

1. **Génération de certificats auto-signés** : un script `generate-certs.js` utilise le module `selfsigned` pour créer un certificat SSL valide pour `localhost`. Les fichiers `cert.pem` et `key.pem` sont stockés dans `app/certs/`.

2. **Serveur HTTPS** : le `server.js` a été modifié pour créer un serveur HTTPS sur le port **8443** (au lieu du simple `app.listen(8080)`). Le serveur lit les fichiers de certificat et les passe à `https.createServer()`.

3. **Redirection HTTP → HTTPS** : un serveur HTTP reste actif sur le port **8080**, mais il redirige automatiquement toutes les requêtes vers le HTTPS avec un code 301 (redirection permanente).

4. **Helmet** : le middleware `helmet` a été ajouté pour configurer automatiquement les en-têtes de sécurité HTTP comme `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.

5. **Scripts externalisés** : comme `helmet` bloque les scripts inline par défaut, les scripts JavaScript qui étaient dans les pages HTML (`profile.html`, `admin.html`) ont été déplacés vers des fichiers `.js` externes dans `public/js/`.

---

## 6.3 Activités moyennes

### 15. Limitation des tentatives de login (brute-force)

**Fichier :** `app/routes/Auth.js`

Pour empêcher un attaquant de tester des milliers de mots de passe à la suite (attaque par force brute), un limiteur de débit a été ajouté sur la route de connexion avec le module `express-rate-limit`. La configuration autorise **5 tentatives par minute par adresse IP**. Au-delà, le serveur refuse la requête et renvoie un message d'erreur `"Trop de tentatives de connexion. Réessayez dans une minute."`. Les en-têtes standard (`RateLimit-*`) sont inclus dans la réponse pour informer le client du nombre de tentatives restantes.

---

### 18. Chiffrement des données sensibles dans la base de données

**Fichiers :** `app/utils/crypto.js`, `app/controllers/AuthController.js`, `app/controllers/ProfileController.js`, `app/controllers/AdminController.js`, `.env`, `app/scripts/migrate-encrypt.js`

Les adresses postales et les emails des utilisateurs sont désormais chiffrés dans la base de données avec l'algorithme **AES-256-CBC** (Advanced Encryption Standard, clé de 256 bits, mode CBC).

- **Clé de chiffrement** : stockée dans `.env` avec la variable `ENCRYPTION_KEY`. Elle est dérivée via SHA-256 pour obtenir exactement 256 bits.
- **Adresse (aléatoire)** : chaque adresse est chiffrée avec un vecteur d'initialisation (IV) aléatoire différent à chaque fois. Même si deux utilisateurs ont la même adresse, le chiffrement sera différent. Format stocké : `rnd:<IV>:<données chiffrées>`.
- **Email (déterministe)** : l'email doit pouvoir être recherché pour la connexion. Il est donc chiffré de façon déterministe (toujours le même résultat pour le même email). Pour cela, on utilise un IV fixe (16 zéros). Format stocké : `det:<données chiffrées>`.
- **Déchiffrement** : quand le serveur renvoie les données (page profil, page admin), il déchiffre automatiquement l'email et l'adresse.
- **Migration** : un script `scripts/migrate-encrypt.js` permet de chiffrer les anciennes données déjà présentes dans la base (utile si la base existait avant cette modification).
- **Compatibilité** : le système détecte automatiquement si une donnée est en clair (ancien format), chiffrée avec l'ancien format ou avec le nouveau format, et la traite correctement.

---

### 19. Protection XSS

**Fichiers :** `app/public/js/api.js`, `app/public/js/admin.js`

**Identification de la faille :** Dans `admin.js`, les données des utilisateurs (nom, email, rôle, adresse) étaient insérées dans la page HTML avec `innerHTML` en utilisant des template literals (`${u.username}`). Si un utilisateur malveillant s'inscrivait avec un pseudo comme `<img src=x onerror=alert('XSS')>`, ce code JavaScript s'exécutait automatiquement dans le navigateur de l'administrateur qui consulte la page d'administration.

**Correction :** Une fonction `escapeHtml()` a été ajoutée dans `api.js`. Elle crée un nœud texte via `document.createTextNode()` et récupère son équivalent HTML, ce qui convertit les caractères dangereux (`<`, `>`, `"`, `&`) en entités HTML (`&lt;`, `&gt;`, `&quot;`, `&amp;`). Cette fonction est utilisée dans `admin.js` pour toutes les données fournies par les utilisateurs (`escapeHtml(u.username)`, `escapeHtml(u.email)`, etc.).

---
