# MyApp — TP CI/CD avec GitHub Actions & Azure

API REST Node.js déployée automatiquement via une pipeline CI/CD complète.

---

## Fonctionnement du pipeline

```
git push (main)
       ↓
GitHub Actions
       ↓
  Job 1 — Tests unitaires (Jest + Supertest)
       ↓
  Job 2 — Tests E2E (Jest + HTTP natif)
       ↓  (uniquement si Job 1 & 2 OK)
  Job 3 — Build image Docker + Push Docker Hub
       ↓
  Job 4 — Déploiement SSH sur VM Azure + Healthcheck
```

## Comment le déploiement est déclenché

Tout push sur la branche `main` déclenche automatiquement la pipeline. Aucune action manuelle n'est requise.

Les jobs 3 et 4 ne s'exécutent que si les tests unitaires **et** E2E passent (`needs: [unit-tests, e2e-tests]`).

---

## Endpoints de l'API

| Méthode | Route             | Description                       |
|---------|-------------------|-----------------------------------|
| GET     | `/health`         | Healthcheck (status + uptime)     |
| GET     | `/api/items`      | Liste des items                   |
| POST    | `/api/items`      | Créer un item (`{ "name": "X" }`) |
| GET     | `/api/hello/:name`| Message de salutation             |

---

## Lancer en local

```bash
npm install
npm start
# → http://localhost:3000/health
```

## Lancer avec Docker

```bash
docker build -t myapp .
docker run -d --name myapp -p 3000:3000 myapp
# → http://localhost:3000/health
```

## Lancer les tests

```bash
# Tests unitaires
npm test

# Tests E2E (nécessite le serveur démarré)
npm start &
npm run test:e2e
```

---

## Choix techniques

| Choix | Raison |
|---|---|
| **Node.js + Express** | Léger, rapide à mettre en place, idéal pour une API REST |
| **Jest + Supertest** | Tests unitaires sans démarrer de vrai serveur réseau |
| **Tests E2E HTTP natifs** | Pas de dépendance lourde (Cypress) en CI, suffisant pour une API |
| **Docker multi-stage** | Image finale légère (uniquement les dépendances de prod) |
| **appleboy/ssh-action** | Action GitHub maintenue, simple pour du SSH sur VM |
| **Déploiement idempotent** | `docker stop/rm` avant `docker run` → jamais deux conteneurs en parallèle |
| **GitHub Secrets** | Aucun identifiant en clair dans le dépôt |

---

## Secrets GitHub à configurer

| Secret | Valeur |
|---|---|
| `DOCKERHUB_USERNAME` | Votre username Docker Hub |
| `DOCKERHUB_TOKEN` | Token d'accès Docker Hub |
| `AZURE_VM_HOST` | IP publique de la VM Azure |
| `AZURE_VM_USER` | Utilisateur SSH (ex: `azureuser`) |
| `AZURE_SSH_PRIVATE_KEY` | Clé privée SSH (contenu du fichier `.pem`) |

---

## Architecture

```
myapp/
├── src/
│   ├── app.js          # Express app (routes)
│   └── server.js       # Démarrage du serveur
├── tests/
│   ├── unit/
│   │   └── app.test.js     # Tests unitaires
│   └── e2e/
│       └── app.e2e.test.js # Tests end-to-end
├── .github/
│   └── workflows/
│       └── ci-cd.yml   # Pipeline GitHub Actions
├── Dockerfile
├── .dockerignore
└── package.json
```
