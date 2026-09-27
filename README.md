# robusto.studio

Portfolio personnel de Lucas, développé avec React et Vite.

## Développement local

```bash
npm install
npm run dev
```

## Vérifications

```bash
npm run lint
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
