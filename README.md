# robusto.studio

Portfolio personnel de Lucas, développé avec React et Vite.

## Maquette du portfolio

Portfolio sur la branche `develop` : beige clair chaud, sauge et
vert profond, avec une seule famille à empattement, Fraunces : graisse 300 pour
le sous-titre du logo et les grands titres, 400 pour le titre « Projets » et la
navigation, et 700 pour les titres des projets. DM Sans est utilisée pour les
textes et les lettrages des projets sans logo restent monospace. Les polices
sont servies localement.

Les treize projets sont regroupés dans `src/data/projects.js`. Chaque projet
dispose de son nom, sa description, sa date, ses technologies et son domaine.
Le site commence directement par les projets. Neuf projets principaux sont
suivis de quatre « Projets divers », introduits par un bandeau vert profond et
présentés dans un bloc ivoire sur fond sauge. Le nom, la présentation et le CV
sont regroupés dans la section « À propos », après les projets.
Les logos EPITA et IMAGE sont placés côte à côte en exposant du nom, avec un
agrandissement centré au survol.
Les logos sont placés à gauche sur ordinateur et centrés en haut sur mobile.
Leurs couleurs sont préservées et les logos sont affichés directement sur le
fond de leur section. `tone` adapte la couleur de toute la section au contraste
du logo (`cream`, `sage` ou `dark`). Les projets sans logo partagent un lettrage
monospace. Le logo IVoK Editor est limité à 200 px de large.
Les filtres et les aperçus de médias sont fonctionnels au clavier.
Les titres des projets utilisent Fraunces en graisse 700, avec des traits plus
solides et une taille légèrement augmentée, adaptée à l’écran.

Les fonds des projets et les grands blocs sont reliés par des courbes SVG
asymétriques, fixes et sans animation. Trois contours alternent pour garder des
séparations souples. Une ligne courbe discrète sépare les cartes de même couleur,
et un liseré vert clair souligne l’entrée des « Projets divers ». Les couleurs
des transitions suivent les projets visibles lorsque les filtres changent.

Les liens de code GitHub vérifient l’accès public via `GET /repos/{owner}/{repo}`,
sans authentification. Le bouton reste visible et désactivé pendant la
vérification, puis s’active pour un dépôt public. Un 404/410 affiche « Indisponible
pour le moment » en rouge désaturé ; une erreur réseau, un délai dépassé ou une limite de
requêtes affiche « Vérification indisponible ».
Les résultats sont conservés quinze minutes dans la session du navigateur et
les requêtes simultanées sont partagées, notamment avec React Strict Mode et les
filtres. Les erreurs ne sont mises en cache qu’une minute, en mémoire.
GitHub ne distingue pas publiquement un dépôt privé d’un dépôt introuvable :
voir la [documentation GitHub](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).

Le header est composé de deux formes arrondies ancrées aux coins supérieurs de
l’écran : la marque à gauche et la navigation à droite. Les deux surfaces sauge
rejoignent les bords haut et latéraux ; seule leur courbe intérieure forme
une frontière avec la page. Les contours SVG utilisent des courbes de Bézier
avec une tangente commune : une vague large sous la marque et une courbe en S
sur le côté de la navigation, qui évoluent au scroll,
même une fois le header compact. Les coins restent fixes. Le logo et le sous-titre
apparaissent de part et d’autre d’un axe invisible commun.
Le header se resserre progressivement en descendant (88 → 68 px sur ordinateur,
96 → 76 px sur mobile) et se déploie en remontant. Les trois liens de navigation
sont disposés verticalement à droite, sur ordinateur et mobile. Sa hauteur initiale reste réservée
pour éviter de déplacer le contenu pendant le scroll. Les espaces entre les
formes laissent passer les clics vers la page. Les animations décoratives
respectent la préférence de réduction des mouvements.

### Ajouter les contenus réels

Les fichiers fournis dans `assets/img/` et `assets/pdf/` sont importés dans
`src/data/projects.js` et inclus automatiquement dans le build. Les huit logos
correspondent à Fastlane, MétroGL, ChromAura, IVoK Signals, Awaken Memory,
Sudoku Solver, CATARACTOR et IVoK Editor. Le cadrage `logoFrame` retire uniquement
les marges transparentes à l’affichage ; les PNG originaux sont conservés. Les sections
Fastlane et Sudoku Solver sont ivoire, Awaken Memory est sauge et CATARACTOR
est vert profond pour faire ressortir leurs logos.

Le projet de typographie utilise le logo LaTeX dans `assets/img/latex-logo.svg`,
issu de [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:LaTeX_logo.svg).

Les manuels PDF sont associés à Fastlane et MétroGL, les rapports à Awaken
Memory (Anluda Games) et Sudoku Solver (Sudo Pacman), et `Projet_TYPO.pdf` à
l’étude typographique.

Les PDF, y compris le CV, s’ouvrent dans une fenêtre de lecture au-dessus du site,
avec un lecteur intégré fondé sur [React-PDF](https://github.com/wojtekmaj/react-pdf)
et PDF.js. Les pages défilent directement sous une barre fine avec zoom, téléchargement
et fermeture. Le zoom va de 50 à 300 %, conserve la position de lecture et se
réinitialise en cliquant sur le pourcentage. Tant que le PDF est ouvert,
Ctrl + molette, Ctrl + / − et Ctrl + 0 pilotent aussi ce zoom (Cmd sur Mac).
Le zoom au trackpad et à la molette est continu, sans seuil, et conserve le point
sous le curseur. Les pages sont agrandies pendant le geste puis rendues à nouveau
à la bonne résolution à son arrêt. Les boutons et raccourcis clavier gardent des
paliers de 25 points ; le défilement normal reste disponible.
Le texte reste sélectionnable et
les liens du PDF fonctionnent. Seules les pages
proches de la zone visible sont rendues pour limiter la mémoire utilisée.
Le lecteur, son worker et ses ressources sont servis localement et chargés à
l’ouverture d’un PDF. La fermeture rend le focus au bouton qui a ouvert le document.

Pour ajouter d’autres contenus, importer les fichiers depuis `assets/`, ou les
déposer dans `public/projects/<identifiant>/`, puis renseigner :

- `logo` : chemin du logo, idéalement transparent ; sinon le lettrage provisoire reste visible.
- `sourceUrl` : URL du dépôt. Sans URL, le bouton est masqué ; `sourcePlanned: true` affiche « Code source à venir » uniquement pour les projets dont la publication est prévue.
- `reportUrl` : chemin du rapport PDF ; `reportLabel` permet d’afficher « Manuel PDF » ; `reportPlanned: true` indique un rapport à venir.
- `slidesUrl` : PDF local ou lien externe de présentation, si une présentation doit être ajoutée.
- `documentUrl` : PDF d’un projet documentaire, comme l’étude typographique ; `documentPlanned: true` indique un document à venir.
- `media` : liste d’illustrations et/ou de vidéos YouTube. Les vidéos disponibles utilisent le lecteur `youtube.com/embed`, avec plein écran et format 16:9 responsive. `embedUrl` permet de reprendre l’URL exacte du code d’intégration fourni par YouTube. Une entrée `pending` peut annoncer une vidéo en préparation.
- `mediaKind: 'images'` : indique des illustrations à venir lorsque `media` est vide. Aucun faux résultat de projet n’est affiché.

```js
logo: '/projects/fastlane/logo.png',
tone: 'cream',
sourceUrl: 'https://github.com/…',
reportUrl: '/projects/fastlane/rapport.pdf',
media: [
  { type: 'image', src: '/projects/fastlane/apercu.webp', alt: 'Vue du moteur de rendu' },
  { type: 'youtube', youtubeId: 'IDENTIFIANT_VIDEO', alt: 'Démonstration de Fastlane Engine' },
],
```

Les dates et technologies non précisées sont laissées vides ou limitées aux
informations connues. Tiger utilise Bison et Flex. Le PBR et Awaken Memory ne proposent pas de code ; celui
d’IVoK Signals reste masqué tant que sa publication n’est pas décidée.

Le favicon SVG reprend le R italique du PNG Sofachrome existant, vectorisé
et placé dans un carré vert profond.

Le CV servi par le site est `public/cv-lucas-estrade.pdf`. Remplacer cette copie
lorsque le CV à la racine est mis à jour.

## Développement local

```bash
npm install
npm run dev
```

## Vérifications

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Déploiement

Le workflow `.github/workflows/deploy.yml` construit et publie le site sur GitHub
Pages à chaque push sur `main`.

Dans GitHub, sélectionner **Settings → Pages → Source → GitHub Actions**. Le
domaine personnalisé `robusto.studio` devra ensuite être ajouté dans ces mêmes
réglages, une fois le domaine actif chez OVH. La configuration DNS et HTTPS reste
à faire à ce moment-là.
