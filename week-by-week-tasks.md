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

- [ ] Scaffold React + TypeScript + Vite app
- [ ] Configure MUI theme and layout system
- [ ] Add light and dark mode support
- [ ] Set up React Router protected routes
- [ ] Configure Axios and React Query
- [ ] Add form handling and Zod validation setup

## Week 9 Tasks

- [ ] Create login and register pages
- [ ] Build user dashboard
- [ ] Build available rooms page
- [ ] Build create reservation page
- [ ] Build my reservations page
- [ ] Build activities page
- [ ] Build profile page

## Week 10 Tasks

- [ ] Build admin dashboard
- [ ] Build floor management page
- [ ] Build reservation management page
- [ ] Build occupancy monitoring page
- [ ] Build statistics page with charts
- [ ] Build super admin dashboard
- [ ] Build audit logs page
- [ ] Build admin management page

## Week 11 Tasks

- [ ] Add Dockerfile for backend
- [ ] Add Dockerfile for frontend
- [ ] Build single docker-compose stack
- [ ] Configure Traefik routes and HTTPS redirection
- [ ] Add Prometheus scrape targets
- [ ] Add Grafana dashboards
- [ ] Add Loki and Promtail configuration
- [ ] Add cAdvisor and node-exporter services

## Week 12 Tasks

- [ ] Add backend unit tests
- [ ] Add backend integration tests
- [ ] Add frontend unit tests
- [ ] Add critical UI flow tests
- [ ] Configure GitHub Actions workflow
- [ ] Add lint, test, build, and security scan jobs
- [ ] Finalize README and operational documentation
