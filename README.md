# Bookini

Smart Floor Reservation System delivered incrementally across 12 weeks.

## Stack

- Backend: FastAPI, SQLAlchemy async, Alembic, Pytest, Ruff
- Frontend: React, TypeScript, Vite, MUI, React Query, React Hook Form, Zod
- Infra: Docker Compose, Traefik v3, Postgres, Redis
- Observability: Prometheus, Grafana, Loki, Promtail, cAdvisor, node-exporter

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m ruff check .
python -m pytest
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run test
npm run build
npm run dev
```

## Full Container Stack

```bash
docker compose up -d --build
```

Main endpoints:

- App via Traefik: <https://localhost>
- Backend API: <https://localhost/api/v1>
- Backend metrics: <https://localhost/metrics>
- Traefik dashboard: <http://localhost:8080>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3000>
- Loki: <http://localhost:3100>

Default dev credentials:

- Grafana user: admin
- Grafana password: admin

## Testing Strategy

### Backend

- Unit tests for services, security, and RBAC
- Integration tests for admin/statistics route authorization envelopes

Run:

```bash
cd backend
python -m pytest
```

### Frontend

- Unit tests for auth provider behavior
- Critical UI flow test for protected-route redirect
- Form validation tests for login

Run:

```bash
cd frontend
npm run test
```

## CI/CD

GitHub Actions workflow:

- Backend lint + test + pip-audit
- Frontend lint + vitest + build + npm audit

See:

- .github/workflows/ci.yml

## Operational Notes

- Set a strong production `SECRET_KEY` before deployment.
- Replace default database/redis credentials outside local dev.
- Configure real TLS certificates in Traefik for production.
- Review `npm audit` and `pip-audit` findings before release.
