# 09 – Local Development Guide

## Prerequisites

Make sure you have these installed on your machine:

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Docker Desktop | 24+ | Run all services via Compose |
| Node.js | 22 | Frontend development |
| Python | 3.14 | Backend development |
| Git | 2.x | Version control |

---

## Quick Start (Full Stack with Docker)

The fastest way to run the entire project is with Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/wissemhammoudi/bookini.git
cd bookini

# 2. Create your environment file
cp .env.example .env
# Edit .env with your values (especially SECRET_KEY)

# 3. Start all services
docker compose up -d

# 4. Check all services are running
docker compose ps
```

Services available:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Admin Frontend | http://localhost:5174 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| MinIO Console | http://localhost:9001 |

---

## Running Services Individually

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Set environment (use a local .env or export vars)
# Ensure DATABASE_URL and SECRET_KEY are set

# Run database migrations
alembic upgrade head

# Start the development server (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API base:** http://localhost:8000/api/v1
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Metrics:** http://localhost:8000/metrics

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (hot-reload)
npm run dev
# → http://localhost:5173
```

### Admin Frontend

```bash
cd admin-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5174
```

---

## Development Commands Reference

### Backend

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run a specific test file
pytest tests/test_reviews.py

# Lint code
python -m ruff check .

# Lint and auto-fix
python -m ruff check . --fix

# Format code
python -m ruff format .

# Generate a new Alembic migration
alembic revision --autogenerate -m "describe your change"

# Apply migrations
alembic upgrade head

# Roll back last migration
alembic downgrade -1
```

### Frontend / Admin Frontend

```bash
# Run all tests (single pass with coverage)
npm run test

# Run tests in watch mode (interactive)
npm run test:watch

# Lint
npm run lint

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project-Wide Git Workflow

```bash
# Start a new feature
git checkout -b feature/my-feature develop

# After completing, push and open a PR to develop
git push origin feature/my-feature

# Merging to develop triggers the CI quality gates
# Merging to master triggers full CI + Docker build + staging deploy
```

**Branch strategy:**
- `master` – Production-ready code. Triggers full CI + deploy.
- `develop` – Integration branch. Triggers CI quality gates + staging deploy.
- `feature/*` – Feature branches. Open PRs against `develop`.

---

## Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Base development config |
| `docker-compose.dev.yml` | Dev overrides (volume mounts, hot-reload) |
| `docker-compose.prod.yml` | Production config (no volume mounts, pre-built images) |

```bash
# Dev (with volume mounts for live-reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.prod.yml up -d
```

---

## Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs for a service
docker compose logs backend -f
docker compose logs frontend -f

# Restart a service
docker compose restart backend

# Rebuild and restart a service
docker compose up --build backend -d

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ destroys DB data)
docker compose down -v

# Clean up unused images
docker image prune -f
```

---

## Troubleshooting

### Backend won't start
- Check that `DATABASE_URL` and `SECRET_KEY` are set correctly in `.env`.
- Ensure PostgreSQL is running: `docker compose ps db`
- Check logs: `docker compose logs backend`

### Migrations fail
- Ensure the database exists and is reachable.
- Run `alembic current` to see the current migration state.
- If schema is out of sync: `alembic upgrade head`

### Frontend can't connect to API
- Verify `VITE_API_BASE_URL` is set in the frontend's `.env` (if used).
- By default, Vite proxies `/api` to `http://localhost:8000` in dev mode.
- Check `vite.config.ts` for the proxy configuration.

### Ruff lint errors in CI
```bash
# Auto-fix all fixable issues
python -m ruff check . --fix
python -m ruff format .
```

### Trivy scan fails in CI
- The Dockerfiles run `apt-get upgrade -y` (Debian) or `apk upgrade --no-cache` (Alpine) to patch OS packages.
- If a new CVE appears, rebuild images: `docker compose build --no-cache backend`

---

*End of documentation. See [README.md](./README.md) for the full index.*
