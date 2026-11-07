<img src='public/logo.svg' align="center"  width="300" alt='LOGO DU CARNET DE VIREMENT'/>

# Carnet de versements

React (Vite) + Firebase. Benoit garde l'argent de Brice : versements, retraits, confirmation de réception et historique non modifiable.

## Règles du jeu
- Chacun se connecte avec **son** mot de passe.
- Les deux voient toutes les opérations (transparence).
- Chacun ne peut modifier ou supprimer que **ses propres** saisies. Le récepteur d'un versement peut seulement le confirmer.
- Ces règles sont appliquées par `firestore.rules` (côté serveur), pas seulement par l'interface.

## Aperçu
 Lien:

## Fonctionnalités

 -Connexion avec mot de pass .
 -Consulter les différentes transactions(retraits,virement...).
 -Ajout d'une opération(transaction).
 -Consulter l'historique des transactions.

## Technologies utilisées

 - React vite
 - Firebase
 - Tailwindcss

## Prérequis

 -Nodejs (version > 22.x.x)
 -compte Firebase

## Installation

 - git clone https://github.com/minkoulou/CARNET-VIREMENT-.git
 - cd CARNET-VIRENMENT-
 - npm install 

 ## Variable d'environement

  VITE_FIREBASE_API_KEY=.........................
  VITE_FIREBASE_AUTH_DOMAIN=.........................
  VITE_FIREBASE_PROJECT_ID=.........................
  VITE_FIREBASE_APP_ID=1:.........................
  VITE_USER1_NAME=.........................
  VITE_USER1_EMAIL=.........................
  VITE_USER2_NAME=.........................
  VITE_USER2_EMAIL=.........................

## structure du  projet 

CARNET-versements/
   node_modules
   public/
         |__logo.svg
    src/
       |__App.jsx
       |__config.js  
       |__firebase.js
       |__Ledger.jsx
       |__main.jsx
       |__style.css
    .env
    .gitignore
    firestore.rules
    index.html
    package-lock.json
    package.json
    README.md
    vite.config.js

## Utilisation
  npm run dev 
  npm run built        //pour contruire la mise en ligne

## Déploiement

 *Vercel
 *Netlify

 ## Contact

  tel: +237 659 09 29 53 / +237 652 37 41 38
  whatsapp: +237 687 11 83 30 /
  email:minkouloubenoit431@gmail.com
  
Gardez vos mots de passe pour vous : changez-les dans la console Firebase si l'un d'eux est découvert.
