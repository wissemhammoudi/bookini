# Smart Floor Reservation System - Week by Week Plan

## Overview

This plan breaks the project into weekly milestones so the backend, frontend, infrastructure, and quality gates can be delivered in a controlled order.

## Week 1 - Project Foundation

Goal: establish the repository structure, backend bootstrap, configuration, logging, and core app wiring.

Deliverables:

- FastAPI project skeleton with Clean Architecture folders
- Environment configuration and settings management
- Structured JSON logging
- Global error handling and response format
- Health endpoints: `/health` and `/ready`

## Week 2 - Database Foundation

Goal: define the core data model and prepare database migrations.

Deliverables:

- PostgreSQL schema setup
- SQLAlchemy async models for users, floors, reservations, activities, and audit logs
- Alembic migration baseline
- Enums and relationships
- Seed strategy for local development

## Week 3 - Authentication

Goal: implement secure user authentication and token management.

Deliverables:

- Register, login, logout, refresh token, change password, and password reset flows
- bcrypt password hashing
- JWT access and refresh token handling
- Auth service layer and repository support
- Authentication tests

## Week 4 - Authorization and RBAC

Goal: protect endpoints and enforce role-based access control.

Deliverables:

- Reusable role guard/dependency
- `SUPER_ADMIN`, `ADMIN`, and `USER` permissions
- Protected route patterns
- Access-denied and auth failure handling
- RBAC tests

## Week 5 - Floor and Reservation Logic

Goal: build the core business functionality for room and floor booking.

Deliverables:

- Floor CRUD with soft delete
- Floor search and filtering
- Reservation creation, cancellation, history, and current reservations
- Conflict detection and validation rules
- Repository and service tests for booking logic

## Week 6 - Activity and Audit Logging

Goal: add activity management and capture important system actions.

Deliverables:

- Activity CRUD tied to reservations
- Audit log persistence and structured event tracking
- Logging for login, logout, register, floor actions, and reservation actions
- Admin-friendly audit views foundation

## Week 7 - Statistics and Occupancy APIs

Goal: expose reporting endpoints for dashboards and analysis.

Deliverables:

- Occupancy metrics API
- Reservation statistics API
- Daily, monthly, annual, and peak-hour reporting
- Most reserved floors and active user metrics
- Chart-ready response DTOs

## Week 8 - Frontend Foundation

Goal: create the React application shell and shared UI infrastructure.

Deliverables:

- Vite + React + TypeScript setup
- MUI theme, light/dark mode, and responsive layout
- Router structure and protected route scaffolding
- Axios client and React Query setup
- Form and validation foundations

## Week 9 - User Experience Pages

Goal: deliver the user-facing reservation flow.

Deliverables:

- Login and register pages
- User dashboard
- Available rooms view
- Create reservation page
- My reservations page
- Activities and profile pages

## Week 10 - Admin and Super Admin Pages

Goal: provide the operational and governance screens.

Deliverables:

- Admin dashboard
- Floor management page
- Reservation management page
- Occupancy monitoring page
- Statistics page
- Super admin dashboard, audit logs, and admin management

## Week 11 - Docker, Traefik, and Observability

Goal: containerize the solution and connect monitoring.

Deliverables:

- Dockerfiles for frontend and backend
- Full docker-compose stack
- Traefik v3 routing and TLS redirection
- Prometheus, Grafana, Loki, Promtail, cAdvisor, and node-exporter setup
- `/metrics` exposure and health checks

## Week 12 - Testing, Hardening, and CI/CD

Goal: finish quality gates and deployment automation.

Deliverables:

- Backend pytest coverage
- Frontend Vitest coverage
- Integration tests for critical workflows
- GitHub Actions pipeline
- Security scan and build validation
- Final documentation and release checklist

## Delivery Order

1. Backend foundation
2. Database models and migrations
3. Authentication
4. RBAC
5. Reservation logic
6. Activity and audit logging
7. Statistics and occupancy APIs
8. Frontend foundation
9. User pages
10. Admin pages
11. Docker and observability
12. Testing and CI/CD
