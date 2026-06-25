# 04 – Backend API

## Overview

The **backend** is a production-ready REST API built with **FastAPI** and **Python 3.14**. It follows **Clean Architecture** principles, separating concerns into clearly defined layers so that business logic is independent of frameworks, databases, and HTTP concerns.

**Location:** `backend/`  
**Entry point:** `backend/app/main.py`  
**API prefix:** `/api/v1`

---

## Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | latest | Web framework (ASGI) |
| Uvicorn | latest | ASGI server |
| Python | 3.14 | Language |
| SQLAlchemy | 2.x (async) | ORM & query builder |
| Alembic | latest | Database migrations |
| Pydantic v2 | latest | Request/response schemas & validation |
| Pydantic Settings | latest | Environment config management |
| PostgreSQL | 16 | Primary database |
| Redis | latest | Caching & session management |
| MinIO | latest | S3-compatible object storage (blueprints, avatars) |
| prometheus_client | latest | Prometheus metrics exposition |
| Ruff | latest | Linting & formatting |
| Pytest | latest | Unit & integration testing |
| pip-audit | latest | Dependency vulnerability scanning |

---

## Architecture: Clean Architecture

```
┌────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│   FastAPI Routers (app/presentation/)                   │
│   Pydantic Schemas (app/schemas/)                       │
└────────────────────┬───────────────────────────────────┘
                     │  calls
                     ▼
┌────────────────────────────────────────────────────────┐
│                  Application/Service Layer              │
│   Business Logic (app/services/)                        │
│   In-memory State Store (AdminWorkspaceStateStore)      │
└────────────────────┬───────────────────────────────────┘
                     │  calls
                     ▼
┌────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                   │
│   DB Session (app/infrastructure/session.py)            │
│   Repository Queries (app/repositories/)                │
│   MinIO Client (app/infrastructure/minio_client.py)     │
└────────────────────┬───────────────────────────────────┘
                     │  manipulates
                     ▼
┌────────────────────────────────────────────────────────┐
│                  Domain Layer                           │
│   SQLAlchemy Models (app/models/)                       │
│   Enums & Value Objects (app/domain/)                   │
└────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── router.py           # Aggregates all routers into /api/v1
│   ├── core/
│   │   ├── config.py               # Pydantic Settings – all env vars
│   │   ├── exception_handlers.py   # Global FastAPI exception handlers
│   │   ├── exceptions.py           # Custom exception classes
│   │   ├── logging_config.py       # Structured logging setup (structlog)
│   │   ├── responses.py            # Standardised success_response() helper
│   │   └── seed.py                 # DB seed functions (super admin, test data)
│   ├── dependencies/
│   │   └── auth.py                 # get_current_user dependency (JWT validation)
│   ├── domain/                     # Domain enums and value objects
│   ├── infrastructure/
│   │   ├── session.py              # Async SQLAlchemy session factory
│   │   └── minio_client.py         # MinIO S3 upload/download client
│   ├── models/                     # SQLAlchemy ORM model definitions
│   │   ├── user.py
│   │   ├── floor.py
│   │   ├── reservation.py
│   │   ├── activity.py
│   │   ├── audit_log.py
│   │   └── public_booking.py
│   ├── presentation/               # FastAPI routers (HTTP layer)
│   ├── repositories/               # Database query abstractions
│   ├── schemas/                    # Pydantic request/response models
│   ├── services/                   # Business logic services
│   └── main.py                     # App factory + middleware setup
├── alembic/                        # Database migration scripts
├── tests/                          # Pytest test suite
├── requirements.txt                # Production dependencies
├── requirements-dev.txt            # Dev/test dependencies
└── Dockerfile                      # Container build definition
```

---

## Application Entry Point (`main.py`)

The app factory (`create_app()`) does the following on startup:

1. **Logging**: Initialises structured logging via `setup_logging()`.
2. **CORS Middleware**: Adds allowed origins from config.
3. **Exception Handlers**: Registers custom handlers for validation and auth errors.
4. **Metrics Middleware**: Wraps every request to increment the `bookiwa7dek_http_requests_total` Prometheus counter (labels: method, path, status_code).
5. **Metrics Endpoint**: Exposes `/metrics` for Prometheus scraping.
6. **Router**: Mounts `api_v1_router` at `/api/v1` and `/api`.

On first boot (`lifespan`):
1. **MinIO**: Creates the object storage bucket if it doesn't exist.
2. **Seeding**: Runs `seed_super_admin_account()` and `seed_default_test_data()`.

---

## Presentation Layer – API Routes

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/auth/register` | No | Register a new user account |
| `POST` | `/auth/login` | No | Login and receive JWT tokens |
| `POST` | `/auth/refresh` | No | Refresh access token using refresh token |
| `GET` | `/auth/me` | ✅ | Get current authenticated user's profile |
| `PUT` | `/auth/profile` | ✅ | Update full_name and email |
| `POST` | `/auth/me/avatar` | ✅ | Upload profile avatar (multipart/form-data) |
| `POST` | `/auth/upload` | ✅ | Upload a generic image file |
| `GET` | `/auth/uploads/{path}` | No | Stream an uploaded file from MinIO |
| `POST` | `/auth/change-password` | ✅ | Change password (requires current password) |
| `POST` | `/auth/password-reset/request` | No | Request a password reset token |
| `POST` | `/auth/password-reset/confirm` | No | Confirm password reset with token |

### Public Booking (`/api/v1/public`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/public/rooms` | No | List all public rooms/spaces |
| `POST` | `/public/bookings` | No | Create a new public booking |
| `GET` | `/public/bookings` | No | List bookings by guest email |
| `GET` | `/public/bookings/calendar` | No | Get booked slots for a room & date range |
| `GET` | `/public/bookings/{reference}` | No | Get booking details by reference |
| `POST` | `/public/contact-requests` | No | Submit a public contact request |

### Reservations (`/api/v1/reservations`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/reservations` | ✅ | List user's reservations |
| `POST` | `/reservations` | ✅ | Create a reservation |
| `GET` | `/reservations/{id}` | ✅ | Get reservation by ID |
| `DELETE` | `/reservations/{id}` | ✅ | Cancel a reservation |

### Floors (`/api/v1/floors`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/floors` | ✅ | List available floors |
| `GET` | `/floors/{id}` | ✅ | Get floor details |

### Admin Workspace (`/api/v1/admin/workspace`)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/admin/workspace` | ✅ Admin | Full workspace state dump |
| `GET` | `/admin/workspace/dashboard` | ✅ Admin | Dashboard KPIs & stats |
| `POST` | `/admin/workspace/floors` | ✅ Admin | Create floor |
| `PUT` | `/admin/workspace/floors/{id}` | ✅ Admin | Update floor |
| `DELETE` | `/admin/workspace/floors/{id}` | ✅ Admin | Delete floor |
| `PUT` | `/admin/workspace/floors/{id}/layout` | ✅ Admin | Save floor builder layout |
| `GET` | `/admin/workspace/users` | ✅ Admin | List all users |
| `PUT` | `/admin/workspace/users/{id}` | ✅ Admin | Update user |
| `DELETE` | `/admin/workspace/users/{id}` | ✅ Admin | Delete user |
| `GET` | `/admin/workspace/reservations` | ✅ Admin | List all reservations |
| `PUT` | `/admin/workspace/reservations/{id}` | ✅ Admin | Update reservation status |
| `GET` | `/admin/workspace/requests` | ✅ Admin | List contact requests |
| `PUT` | `/admin/workspace/requests/{id}` | ✅ Admin | Update contact request status |

---

## Service Layer

### `AuthService` (`services/auth_service.py`)
- `register()` – validates email uniqueness, hashes password, creates user, returns JWT pair.
- `login()` – validates credentials, returns JWT pair.
- `refresh_token()` – validates refresh token, returns new access token.
- `request_password_reset()` – generates a time-limited reset token.
- `confirm_password_reset()` – validates token, updates hashed password.
- `change_password()` – validates current password, updates to new hash.
- `update_profile()` – updates `full_name` and `email`.
- `update_avatar()` – updates `avatar_url` field.

### `PublicBookingService` (`services/public_booking_service.py`)
- `create_booking()` – validates room, floor, pricing, availability, generates reference, writes to DB.
- `get_booking_by_reference()` – looks up booking by reference string.
- `list_bookings_by_email()` – lists all bookings for a guest email.
- `list_calendar_slots()` – returns occupied time slots for a room & date range.
- `_calculate_billable_hours()` – computes hours between start/end time strings.
- `_resolve_blueprint_room()` / `_resolve_reservation_area()` – resolves floor plan data to match selected room key.

### `PublicCatalogService` (`services/public_catalog_service.py`)
- `build_rooms_catalog()` – builds the public room catalogue from admin workspace state.

### `AdminWorkspaceStateStore` (`services/admin_workspace_state_store.py`)
- In-memory singleton that holds all admin workspace state (organisations, places, floors, users, reservations, contact requests, activity logs).
- Seeded from the DB on first access.
- Used for fast reads without hitting the database on every request.

### `AuditLogService` (`services/audit_log_service.py`)
- `record()` – writes an audit log entry for a user action (LOGIN, REGISTER, DELETE, etc.).

### `ReservationService` (`services/reservation_service.py`)
- Handles creation and cancellation of user reservations with conflict checking.

### `ReviewService` (`services/review_service.py`)
- Manages floor reviews and admin ratings submission and retrieval.

---

## Authentication & Security

- **JWT Tokens**: Access tokens (15 min expiry) and refresh tokens (7 days).
- **Algorithm**: HS256 (configurable via `JWT_ALGORITHM`).
- **`get_current_user` dependency**: Validates `Authorization: Bearer <token>` header on protected routes; raises 401 if invalid.
- **Password Hashing**: `bcrypt` via `passlib`.
- **Audit Logging**: Every login, register, and sensitive action is recorded in the `audit_logs` table with IP address and metadata.

---

## Database & Migrations

Managed by **Alembic** with async SQLAlchemy.

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "describe change"

# Roll back last migration
alembic downgrade -1
```

Migration scripts live in `backend/alembic/versions/`.

---

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Start dev server (with reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Lint & auto-fix
python -m ruff check . --fix

# Format code
python -m ruff format .
```

Interactive API docs are available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

*Next: [05-database.md](./05-database.md)*
