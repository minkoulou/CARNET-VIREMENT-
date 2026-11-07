# Carnet de versements

React (Vite) + Firebase. Benoit garde l'argent de Brice : versements, retraits, confirmation de réception et historique non modifiable.

## Règles du jeu
- Chacun se connecte avec **son** mot de passe.
- Les deux voient toutes les opérations (transparence).
- Chacun ne peut modifier ou supprimer que **ses propres** saisies. Le récepteur d'un versement peut seulement le confirmer.
- Ces règles sont appliquées par `firestore.rules` (côté serveur), pas seulement par l'interface.

## Mise en route
1. Console Firebase → nouveau projet → **Authentication** → méthode de connexion **E-mail/Mot de passe** (activer).
2. **Authentication → Utilisateurs → Ajouter un utilisateur** : créez tout de suite les 2 comptes (`benoit@carnet.app` et `brice@carnet.app`, ou vos vraies adresses) avec chacun son mot de passe (6 caractères minimum). Ces adresses doivent être identiques dans `.env` et dans `firestore.rules`.
3. **Firestore Database** → créer → onglet **Règles** → coller `firestore.rules` → Publier.
4. **Authentication → Paramètres → Domaines autorisés** : ajouter votre domaine d'hébergement.
5. Copier `.env.example` en `.env` et remplir la config Web Firebase.
6. `npm install`, `npm run dev` pour tester, `npm run build` puis héberger `dist/` (Firebase Hosting, Netlify ou Vercel ; y ajouter les variables `VITE_*`).

Gardez vos mots de passe pour vous : changez-les dans la console Firebase si l'un d'eux est découvert.
