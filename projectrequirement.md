# PROJECT_SPECIFICATION.md

# Smart Floor Reservation System

## Version

1.0

## Project Type

Production-Ready Full Stack Application

---

# 1. Objective

Build a production-ready Smart Floor Reservation System that allows users to reserve rooms and floors inside an organization.

The platform must support:

* User reservations
* Activity planning
* Occupancy monitoring
* Administrative management
* Statistics and reporting
* Audit logging
* Monitoring and observability
* Containerized deployment

The entire solution must be generated using modern software engineering practices and production-ready architecture.

---

# 2. Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Material UI
* React Router
* React Query
* Axios
* React Hook Form
* Zod
* Recharts

## Backend

* FastAPI
* Python 3.12+
* SQLAlchemy Async
* Alembic
* Pydantic V2
* Passlib
* JWT Authentication
* Redis

## Database

* PostgreSQL 16

## Infrastructure

* Docker
* Docker Compose
* Traefik v3

## Monitoring

* Prometheus
* Grafana
* Loki
* Promtail
* cAdvisor
* Node Exporter

## CI/CD

* GitHub Actions

---

# 3. Architecture Style

Use Clean Architecture.

Layers:

1. Presentation Layer
2. Application Layer
3. Domain Layer
4. Infrastructure Layer

Patterns:

* Repository Pattern
* Service Pattern
* Dependency Injection
* Unit of Work
* DTO Pattern

Business logic must never exist inside API routes.

Routes only call services.

Services call repositories.

Repositories communicate with the database.

---

# 4. User Roles

## SUPER_ADMIN

Permissions:

* Manage admins
* View audit logs
* View global statistics
* Manage system settings

---

## ADMIN

Permissions:

* Manage floors
* Manage reservations
* View occupancy
* View statistics

---

## USER

Permissions:

* Register
* Login
* Create reservations
* Cancel reservations
* Manage profile
* Create activities

---

# 5. Functional Requirements

## Authentication

Features:

* Registration
* Login
* Refresh Token
* Logout
* Password Reset
* Change Password

Authentication method:

JWT

Access Token Lifetime:

15 minutes

Refresh Token Lifetime:

7 days

Password Hashing:

bcrypt

---

## Authorization

Role-Based Access Control (RBAC)

Roles:

* SUPER_ADMIN
* ADMIN
* USER

Authorization middleware must be reusable.

Example:

@require_roles(["ADMIN"])

---

# 6. Floor Management

Entity:

Floor

Fields:

* id
* name
* capacity
* building
* floor_number
* location
* description
* status
* is_deleted
* created_at
* updated_at

Status values:

* AVAILABLE
* OCCUPIED
* MAINTENANCE

Features:

* Create Floor
* Update Floor
* Delete Floor (Soft Delete)
* List Floors
* Search Floors
* Filter Floors

---

# 7. Reservation Management

Entity:

Reservation

Fields:

* id
* user_id
* floor_id
* start_time
* end_time
* status
* created_at
* updated_at

Status:

* PENDING
* CONFIRMED
* CANCELLED
* COMPLETED

Validation Rules:

* No overlap
* No reservations in the past
* End time > Start time
* Floor must exist
* Floor must not be deleted

Features:

* Create Reservation
* Cancel Reservation
* Reservation History
* Current Reservations

---

# 8. Activity Management

Entity:

Activity

Fields:

* id
* reservation_id
* title
* description
* created_at

Features:

* Create Activity
* Update Activity
* Delete Activity
* List Activities

---

# 9. Occupancy Monitoring

Admin Dashboard Metrics:

* Total Rooms
* Occupied Rooms
* Available Rooms
* Occupancy Percentage

Formula:

Occupancy Rate = Occupied Rooms / Total Rooms * 100

---

# 10. Statistics Module

Dashboard Metrics:

* Total Reservations
* Daily Reservations
* Monthly Reservations
* Annual Reservations
* Cancellation Rate
* Most Reserved Rooms
* Peak Reservation Hours
* Active Users

Charts:

* Bar Chart
* Line Chart
* Pie Chart

---

# 11. Audit Logging

Track all important actions.

Actions:

* LOGIN
* LOGOUT
* REGISTER
* FLOOR_CREATED
* FLOOR_UPDATED
* FLOOR_DELETED
* RESERVATION_CREATED
* RESERVATION_CANCELLED
* ADMIN_CREATED

Audit Log Fields:

* id
* user_id
* action
* ip_address
* metadata
* timestamp

Use structured JSON logging.

---

# 12. Database Design

## Users

* id UUID PK
* full_name
* email
* password_hash
* role
* is_active
* created_at
* updated_at

## Floors

* id UUID PK
* name
* capacity
* building
* floor_number
* location
* description
* status
* is_deleted
* created_at
* updated_at

## Reservations

* id UUID PK
* user_id FK
* floor_id FK
* start_time
* end_time
* status
* created_at
* updated_at

## Activities

* id UUID PK
* reservation_id FK
* title
* description
* created_at

## Audit Logs

* id UUID PK
* user_id FK
* action
* ip_address
* metadata
* timestamp

---

# 13. API Design

Base URL:

/api/v1

Response Format:

{
"success": true,
"message": "Operation successful",
"data": {}
}

Error Format:

{
"success": false,
"message": "Validation error",
"errors": []
}

---

# 14. Backend Folder Structure

backend/

app/

api/

v1/

auth/

users/

floors/

reservations/

activities/

statistics/

core/

config.py

database.py

security.py

logging.py

models/

schemas/

repositories/

services/

dependencies/

middleware/

utils/

tests/

alembic/

requirements.txt

Dockerfile

---

# 15. Frontend Folder Structure

frontend/

src/

api/

components/

pages/

layouts/

hooks/

contexts/

routes/

services/

types/

utils/

theme/

App.tsx

Dockerfile

---

# 16. Required Frontend Pages

Public:

* Login
* Register

User:

* Dashboard
* Available Rooms
* Create Reservation
* My Reservations
* Activities
* Profile

Admin:

* Dashboard
* Floor Management
* Reservation Management
* Occupancy Monitoring
* Statistics

Super Admin:

* Dashboard
* Admin Management
* Audit Logs
* Global Statistics

---

# 17. UI Requirements

Material UI

Requirements:

* Responsive
* Mobile Friendly
* Dark Mode
* Light Mode

Theme:

Primary Color:

# 1976D2

Secondary Color:

# 424242

---

# 18. Docker Requirements

Every service must have a Dockerfile.

Create a single docker-compose.yml.

Services:

* traefik
* frontend
* backend
* postgres
* redis
* pgadmin
* prometheus
* grafana
* loki
* promtail
* cadvisor
* node-exporter

All services must run in Docker.

---

# 19. Traefik Requirements

Traefik Version:

v3

Requirements:

* Docker Provider
* Automatic Service Discovery
* HTTPS Redirection
* Dashboard Enabled
* Middleware Support
* Prometheus Metrics

Features:

* Routing
* SSL Termination
* Load Balancing

Use Docker labels for routing.

---

# 20. Monitoring Requirements

## Prometheus

Collect:

* Request Count
* Request Duration
* Error Count
* CPU Usage
* Memory Usage

Expose:

/metrics

---

## Grafana

Create Dashboards:

* Backend Dashboard
* Database Dashboard
* Infrastructure Dashboard
* Business Dashboard

---

## Loki

Centralized logging.

---

## Promtail

Collect logs from:

* Backend
* Frontend
* Traefik
* Docker

---

## cAdvisor

Monitor containers.

---

## Node Exporter

Monitor server metrics.

---

# 21. Logging Requirements

Use JSON logs.

Example:

{
"timestamp": "",
"level": "INFO",
"service": "backend",
"message": "Reservation created",
"user_id": ""
}

---

# 22. Redis Requirements

Use Redis for:

* Caching
* Session Storage
* Rate Limiting
* Temporary Data

---

# 23. Security Requirements

Implement:

* JWT Authentication
* Refresh Tokens
* Password Hashing
* RBAC
* Rate Limiting
* Input Validation
* Security Headers
* HTTPS
* CORS Protection

---

# 24. Performance Requirements

Target:

API Response < 500ms

Implement:

* Pagination
* Query Optimization
* Indexes
* Redis Cache

---

# 25. Health Checks

Endpoints:

GET /health

GET /ready

GET /metrics

Docker health checks required for all services.

---

# 26. Testing Requirements

Backend:

Pytest

Frontend:

Vitest

Coverage Target:

80%+

Required:

* Unit Tests
* Integration Tests

---

# 27. CI/CD Requirements

GitHub Actions

Pipeline:

1. Install Dependencies
2. Lint
3. Run Tests
4. Build Frontend
5. Build Backend
6. Build Docker Images
7. Security Scan
8. Push Images
9. Deploy

---

# 28. Environment Variables

Backend:

DATABASE_URL=

SECRET_KEY=

JWT_ALGORITHM=

ACCESS_TOKEN_EXPIRE_MINUTES=

REFRESH_TOKEN_EXPIRE_DAYS=

REDIS_URL=

Frontend:

VITE_API_URL=

---

# 29. Deliverables

Generate:

* Complete Frontend
* Complete Backend
* PostgreSQL Schema
* Alembic Migrations
* JWT Authentication
* RBAC
* Dockerfiles
* Docker Compose
* Traefik Configuration
* Prometheus Configuration
* Grafana Dashboards
* Loki Configuration
* Redis Integration
* CI/CD Pipeline
* Unit Tests
* OpenAPI Documentation
* README

---

# 30. Copilot Agent Instructions

Generate the project incrementally.

Priority Order:

1. Backend Foundation
2. Database Models
3. Authentication
4. RBAC
5. Reservation Logic
6. Frontend Foundation
7. Dashboard Pages
8. Docker Setup
9. Monitoring Stack
10. CI/CD

Requirements:

* Production Ready
* Fully Typed
* Clean Architecture
* Async SQLAlchemy
* TypeScript Strict Mode
* Structured Logging
* High Test Coverage
* Docker First Development
* Observability First Design

Do not generate placeholder code.

Generate complete implementations.
