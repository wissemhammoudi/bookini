# 01 – Project Overview

## What is Bookini?

**Bookini** is a production-ready, containerised **Smart Floor Reservation System**. It enables users and organisations to browse, reserve, and manage office spaces – rooms, desks, and floors – through a modern web interface.

The platform is composed of three independently deployable web applications sharing a single FastAPI backend:

| Service | Purpose |
|---------|---------|
| **Frontend** | Public-facing user booking portal |
| **Admin Frontend** | Organisation admin panel with floor builder, analytics, and management tools |
| **Backend** | REST API powered by FastAPI; source of truth for all data |

---

## Business Goals

- **Self-service reservations** – Users can browse available spaces, view interactive floor plans, and complete bookings without needing to register.
- **Admin workspace** – Admins can manage floors, organisations, reservations, users, ratings, and contact requests from a single unified workspace.
- **Interactive floor layouts** – A built-in 2D canvas editor allows admins to design floors with rooms, desks, walls, projectors, and equipment.
- **Observability** – Full metrics, logs, and tracing via a Prometheus / Grafana / Loki monitoring stack.
- **Secure deployments** – Automated CI/CD with quality gates (lint, tests, security scans) and Traefik for TLS termination.

---

## High-Level Architecture

```
┌────────────────────┐     ┌────────────────────┐
│   User Frontend    │     │  Admin Frontend     │
│  (React + Vite)    │     │  (React + Vite)     │
└────────┬───────────┘     └──────────┬──────────┘
         │   HTTPS (via Traefik)      │
         └──────────────┬─────────────┘
                        │
               ┌────────▼────────┐
               │  FastAPI Backend │
               │  (Python 3.14)   │
               └───┬─────────┬───┘
                   │         │
          ┌────────▼─┐   ┌───▼──────┐
          │PostgreSQL│   │  Redis   │
          │   (DB)   │   │ (Cache)  │
          └──────────┘   └──────────┘
                   │
          ┌────────▼─────────┐
          │  MinIO (S3)       │
          │  (File Storage)   │
          └──────────────────┘

    ─────────── Monitoring Stack ───────────
    Prometheus  │  Grafana  │  Loki  │  Promtail
    cAdvisor    │  Node Exporter
```

---

## Repository Layout

```
bookini/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline (GitHub Actions)
├── admin-frontend/                # Admin Panel – React/Vite/TS/MUI
├── backend/                       # REST API – FastAPI/Python/SQLAlchemy
├── frontend/                      # User Portal – React/Vite/TS/MUI
├── monitoring/                    # Observability configs (Grafana, Loki, Prometheus, Promtail)
├── traefik/                       # Reverse proxy config & TLS
├── docs/                          # ← You are here (project documentation)
├── docker-compose.yml             # Development compose
├── docker-compose.dev.yml         # Dev overrides
├── docker-compose.prod.yml        # Production compose
├── .env.example                   # Environment variable template
└── README.md                      # Quick-start guide
```

---

## Technology Snapshot

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite 8 |
| Admin Framework | React 19 + Vite 8 |
| Language (UI) | TypeScript (strict mode) |
| UI Components | Material UI (MUI) v9 |
| API Client | Axios + TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Backend Framework | FastAPI (Python 3.14) |
| ORM | SQLAlchemy (Async) |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Cache | Redis |
| File Storage | MinIO (S3-compatible) |
| Reverse Proxy | Traefik v3 (Let's Encrypt TLS) |
| Monitoring | Prometheus + Grafana + Loki + Promtail |
| CI/CD | GitHub Actions |
| Security Scan | Trivy (images) + pip-audit (deps) |

---

*Next: [02-frontend.md](./02-frontend.md)*
