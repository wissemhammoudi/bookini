# 07 – CI/CD Pipeline

## Overview

Bookini uses **GitHub Actions** for continuous integration and deployment. The pipeline is defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) and runs on every push or pull request to `master` or `develop`.

---

## Trigger Conditions

| Event | Branches | Jobs Triggered |
|-------|----------|----------------|
| `push` | `master`, `develop` | All jobs |
| `pull_request` | `master`, `develop` | Quality gates only |
| `workflow_dispatch` | Any | All jobs (manual trigger) |

> Concurrency is controlled with `cancel-in-progress: true` — only the latest run per branch is kept active.

---

## Pipeline Flow

```
Push / PR to master or develop
           │
           ▼
┌──────────────────────────────────┐
│        Quality Gates (parallel)  │
│  ┌─────────────┐ ┌────────────┐  │
│  │  Backend    │ │ Frontend   │  │
│  │  Quality    │ │ Quality    │  │
│  └─────────────┘ └────────────┘  │
│  ┌──────────────────────────┐    │
│  │ Admin Frontend Quality   │    │
│  └──────────────────────────┘    │
└───────────────┬──────────────────┘
                │  (only on push to master/develop)
                ▼
┌──────────────────────────────────┐
│   Build, Scan & Push Images      │
│   (Docker Buildx + Trivy)        │
└───────────────┬──────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│   Deploy to Staging VPS          │
│   (SSH + docker compose pull+up) │
└───────────────┬──────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│   Staging Smoke Checks           │
│   (HTTP health assertions)       │
└──────────────────────────────────┘
```

---

## Jobs

### 1. `backend-quality`

Runs on: `ubuntu-latest`, Python `3.14`

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Fetch source code |
| Setup Python | `actions/setup-python@v5` | Install Python 3.14 with pip cache |
| Install deps | `pip install -r requirements.txt -r requirements-dev.txt` | Install backend packages |
| Lint | `python -m ruff check .` | Code style & error checking |
| Tests | `python -m pytest` | Run full test suite |
| Security scan | `pip-audit -r requirements.txt` | Audit Python dependencies for CVEs |

---

### 2. `frontend-quality`

Runs on: `ubuntu-latest`, Node `22`

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Fetch source code |
| Setup Node | `actions/setup-node@v4` | Install Node 22 with npm cache |
| Install deps | `npm ci` | Clean install from lockfile |
| Lint | `npm run lint` | ESLint checks |
| Tests | `npm run test` | Vitest unit tests with coverage |
| Build | `npm run build` | TypeScript compile + Vite production build |
| Security scan | `npm audit --audit-level=high` | Audit npm dependencies |

---

### 3. `admin-frontend-quality`

Same as `frontend-quality` but runs in the `admin-frontend/` directory.

| Step | Command | Purpose |
|------|---------|---------|
| Lint | `npm run lint` | ESLint checks |
| Tests | `npm run test` | Vitest unit tests |
| Build | `npm run build` | TypeScript + Vite production build |

---

### 4. `package-images`

Runs **only on push** to `master` or `develop`. Depends on all three quality gate jobs passing.

Uses **Docker Buildx** with GitHub Actions layer caching (`type=gha`) for fast incremental builds.

| Step | Purpose |
|------|---------|
| Login to Docker Hub | Authenticate with `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` secrets |
| Build & push backend image | `docker/build-push-action@v6` – context: `./backend` |
| Build & push frontend image | `docker/build-push-action@v6` – context: `./frontend` |
| Build & push admin frontend image | `docker/build-push-action@v6` – context: `./admin-frontend` |
| Trivy scan (backend) | `aquasecurity/trivy-action@v0.36.0` – HIGH/CRITICAL, ignore unfixed |
| Trivy scan (frontend) | Same, context: frontend image |
| Trivy scan (admin frontend) | Same, context: admin frontend image |

Images are tagged with both:
- `<image>:latest`
- `<image>:<github.sha>`

> If Trivy finds any **HIGH or CRITICAL** vulnerability that has a fix available, the build fails with exit code 1.

---

### 5. `deploy-staging`

Runs **only on push** to `master` or `develop`. Depends on `package-images` passing.

Uses `appleboy/ssh-action@v1.0.3` to SSH into the staging VPS and:

```bash
# Dynamic branch checkout on VPS
git fetch origin ${{ github.ref_name }}
git checkout ${{ github.ref_name }}
git pull --ff-only origin ${{ github.ref_name }}

# Login to Docker Hub
echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

# Pull new images and restart services
docker compose -f docker-compose.prod.yml pull backend frontend admin-frontend
docker compose -f docker-compose.prod.yml up -d
docker image prune -f
```

Environment variables injected during SSH:
- `DOMAIN_NAME`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `SECRET_KEY`, `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`
- `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `ADMIN_FRONTEND_IMAGE` (pinned to `github.sha`)

After deploy, a **smoke test script** validates the three service URLs are responding:
```bash
.github/workflows/scripts/smoke-tests.sh \
  "$FRONTEND_URL" \
  "$ADMIN_FRONTEND_URL" \
  "$API_HEALTH_URL"
```

---

## Required GitHub Secrets

| Secret | Used By | Description |
|--------|---------|-------------|
| `DOCKERHUB_USERNAME` | `package-images`, `deploy-staging` | Docker Hub username |
| `DOCKERHUB_TOKEN` | `package-images`, `deploy-staging` | Docker Hub access token |
| `SSH_HOST` | `deploy-staging` | VPS IP or hostname |
| `SSH_USER` | `deploy-staging` | SSH username |
| `SSH_PRIVATE_KEY` | `deploy-staging` | SSH private key |
| `SSH_PORT` | `deploy-staging` | SSH port (defaults to 22) |
| `SSH_TARGET_DIR` | `deploy-staging` | Path to project on VPS |
| `DOMAIN_NAME` | `deploy-staging` | Production domain |
| `POSTGRES_DB` | `deploy-staging` | Database name |
| `POSTGRES_USER` | `deploy-staging` | Database user |
| `POSTGRES_PASSWORD` | `deploy-staging` | Database password |
| `SECRET_KEY` | `deploy-staging` | JWT signing key |
| `GRAFANA_ADMIN_USER` | `deploy-staging` | Grafana admin username |
| `GRAFANA_ADMIN_PASSWORD` | `deploy-staging` | Grafana admin password |
| `FRONTEND_URL` | `deploy-staging` | Frontend smoke test URL |
| `ADMIN_FRONTEND_URL` | `deploy-staging` | Admin frontend smoke test URL |
| `API_HEALTH_URL` | `deploy-staging` | Backend health endpoint URL |

---

## Docker Images

| Image Name | Registry | Tag Strategy |
|------------|----------|-------------|
| `<user>/bookini-backend` | Docker Hub | `latest` + `sha` |
| `<user>/bookini-frontend` | Docker Hub | `latest` + `sha` |
| `<user>/bookini-admin-frontend` | Docker Hub | `latest` + `sha` |

---

*Next: [08-environment.md](./08-environment.md)*
