# Smart Floor Reservation System - Weekly Task Checklist

## Week 1 Tasks

- [x] Create backend folder structure for Clean Architecture
- [x] Add configuration loader and environment validation
- [x] Set up structured JSON logging
- [x] Add global exception handlers and API response helpers
- [x] Implement `/health` and `/ready`

## Week 2 Tasks

- [x] Define SQLAlchemy async base and database session handling
- [x] Create models for users, floors, reservations, activities, and audit logs
- [x] Define status and role enums
- [x] Configure Alembic and create initial migration
- [x] Verify table relationships and constraints

## Week 3 Tasks

- [x] Implement password hashing with bcrypt
- [x] Build registration endpoint and service
- [x] Build login endpoint and token issuance
- [x] Add refresh token flow and logout flow
- [x] Implement password reset and change password flows
- [x] Write authentication tests

## Week 4 Tasks

- [x] Create reusable role-based authorization dependency
- [x] Protect admin and super admin routes
- [x] Add permission checks to sensitive operations
- [x] Standardize unauthorized and forbidden responses
- [x] Write RBAC tests

## Week 5 Tasks

- [x] Implement floor repository and service
- [x] Add floor create, update, delete, list, and search endpoints
- [x] Implement soft delete behavior
- [x] Implement reservation repository and service
- [x] Validate overlap, time, and floor existence rules
- [x] Add reservation history and current reservation queries
- [x] Test reservation conflict scenarios

## Week 6 Tasks

- [x] Implement activity CRUD linked to reservations
- [x] Add audit log entity persistence
- [x] Record login, logout, register, floor, and reservation actions
- [x] Add metadata and IP capture for audit events
- [x] Test event logging and activity flows

## Week 7 Tasks

- [x] Build occupancy metrics service
- [x] Build reservation statistics service
- [x] Add endpoints for daily, monthly, annual, and cancellation metrics
- [x] Add peak hour and active user reports
- [x] Return chart-friendly payloads for frontend graphs

## Week 8 Tasks

- [x] Scaffold React + TypeScript + Vite app
- [x] Configure MUI theme and layout system
- [x] Add light and dark mode support
- [x] Set up React Router protected routes
- [x] Configure Axios and React Query
- [x] Add form handling and Zod validation setup

## Week 9 Tasks

- [x] Create login and register pages
- [x] Build user dashboard
- [x] Build available rooms page
- [x] Build create reservation page
- [x] Build my reservations page
- [x] Build activities page
- [x] Build profile page

## Week 10 Tasks

- [x] Build admin dashboard
- [x] Build floor management page
- [x] Build reservation management page
- [x] Build occupancy monitoring page
- [x] Build statistics page with charts
- [x] Build super admin dashboard
- [x] Build audit logs page
- [x] Build admin management page

## Week 11 Tasks

- [x] Add Dockerfile for backend
- [x] Add Dockerfile for frontend
- [x] Build single docker-compose stack
- [x] Configure Traefik routes and HTTPS redirection
- [x] Add Prometheus scrape targets
- [x] Add Grafana dashboards
- [x] Add Loki and Promtail configuration
- [x] Add cAdvisor and node-exporter services

## Week 12 Tasks

- [x] Add backend unit tests
- [x] Add backend integration tests
- [x] Add frontend unit tests
- [x] Add critical UI flow tests
- [x] Configure GitHub Actions workflow
- [x] Add lint, test, build, and security scan jobs
- [x] Finalize README and operational documentation
