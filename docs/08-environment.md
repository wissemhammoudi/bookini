# 08 – Environment Variables

## Overview

All environment configuration is managed via `.env` files and validated at boot by **Pydantic Settings** (`BaseSettings`).

Copy the template to get started:
```bash
cp .env.example .env
```

> **Important:** Never commit `.env` to version control. It's excluded by `.gitignore`.

---

## Configuration Loading

Defined in `backend/app/core/config.py`:

1. **Source precedence:** Shell environment variables override `.env` file values.
2. **Strict validation:** Pydantic validates types at startup. Missing required fields abort the server with a clear error message.
3. **Fail-fast:** If `SECRET_KEY` or `DATABASE_URL` is missing or invalid, the app refuses to start.

---

## Variable Reference

### Core Backend

| Variable | Type | Default | Required | Description |
|----------|------|---------|:--------:|-------------|
| `APP_ENV` | `development\|staging\|production` | `development` | No | Controls CORS, debug settings |
| `LOG_LEVEL` | `DEBUG\|INFO\|WARNING\|ERROR` | `INFO` | No | Logging verbosity |
| `API_HOST` | string | `0.0.0.0` | No | Uvicorn bind address |
| `API_PORT` | integer (1–65535) | `8000` | No | Uvicorn bind port |
| `DATABASE_URL` | SQLAlchemy URL | — | **Yes** | PostgreSQL async connection URL |
| `REDIS_URL` | Redis URL | `redis://redis:6379/0` | No | Redis connection |
| `SECRET_KEY` | hex string (min 16 chars) | — | **Yes** | JWT signing key (use `openssl rand -hex 32`) |
| `JWT_ALGORITHM` | string | `HS256` | No | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | integer | `15` | No | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | integer | `7` | No | Refresh token lifetime |
| `CORS_ALLOW_ORIGINS` | JSON list | (preset) | No | Allowed CORS origins |

**DATABASE_URL format:**
```
postgresql+psycopg://bookini:password@db:5432/bookinidb
```

---

### PostgreSQL (Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `bookiwa7dek` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | *(change me)* | Database password |

---

### Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection URL |

---

### MinIO (Object Storage)

| Variable | Default | Description |
|----------|---------|-------------|
| `MINIO_ENDPOINT` | `minio:9000` | MinIO server address |
| `MINIO_ACCESS_KEY` | `minioadmin` | Access key |
| `MINIO_SECRET_KEY` | `minioadmin` | Secret key |
| `MINIO_BUCKET` | `bookini` | Target bucket name |
| `MINIO_SECURE` | `false` | Use HTTPS (set `true` in production) |

---

### Database Seeding

| Variable | Default | Description |
|----------|---------|-------------|
| `SEED_DEFAULT_USERS` | `false` | Seed test users on startup |
| `SEED_SUPER_ADMIN_EMAIL` | — | Super admin email |
| `SEED_SUPER_ADMIN_PASSWORD` | — | Super admin password |
| `SEED_ADMIN_EMAIL` | — | Default admin email |
| `SEED_ADMIN_PASSWORD` | — | Default admin password |
| `SEED_USER_EMAIL` | — | Default user email |
| `SEED_USER_PASSWORD` | — | Default user password |

> In production, set `SEED_DEFAULT_USERS=false` to prevent test accounts from being created.

---

### Traefik & Domain

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DOMAIN_NAME` | **Yes** | Root domain (e.g. `bookini.example.com`) |

---

### Production Docker Images

| Variable | Required | Description |
|----------|:--------:|-------------|
| `BACKEND_IMAGE` | **Yes (CI)** | Docker Hub tag for the backend |
| `FRONTEND_IMAGE` | **Yes (CI)** | Docker Hub tag for the frontend |
| `ADMIN_FRONTEND_IMAGE` | **Yes (CI)** | Docker Hub tag for the admin frontend |

These are injected automatically by the GitHub Actions pipeline.

---

### Monitoring (Grafana)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `GRAFANA_ADMIN_USER` | **Yes** | Grafana dashboard admin username |
| `GRAFANA_ADMIN_PASSWORD` | **Yes** | Grafana dashboard admin password |

---

## Example `.env` File

```dotenv
# === Core ===
APP_ENV=production
LOG_LEVEL=INFO

# === Database ===
POSTGRES_DB=bookiwa7dek
POSTGRES_USER=postgres
POSTGRES_PASSWORD=my-very-secure-db-password

# === Redis ===
REDIS_URL=redis://redis:6379/0

# === MinIO ===
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bookini
MINIO_SECURE=false

# === Backend Auth ===
# Generate: openssl rand -hex 32
SECRET_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2

# === Seeding ===
SEED_DEFAULT_USERS=false
SEED_SUPER_ADMIN_EMAIL=superadmin@bookini.com
SEED_SUPER_ADMIN_PASSWORD=SecurePassword123!

# === Traefik ===
DOMAIN_NAME=bookini.example.com

# === Monitoring ===
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure-grafana-password

# === CI-injected (leave blank locally) ===
BACKEND_IMAGE=wissem020/bookini-backend:latest
FRONTEND_IMAGE=wissem020/bookini-frontend:latest
ADMIN_FRONTEND_IMAGE=wissem020/bookini-admin-frontend:latest
```

---

*Next: [09-development.md](./09-development.md)*
