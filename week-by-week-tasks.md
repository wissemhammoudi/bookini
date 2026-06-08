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

- [ ] Implement password hashing with bcrypt
- [ ] Build registration endpoint and service
- [ ] Build login endpoint and token issuance
- [ ] Add refresh token flow and logout flow
- [ ] Implement password reset and change password flows
- [ ] Write authentication tests

## Week 4 Tasks

- [ ] Create reusable role-based authorization dependency
- [ ] Protect admin and super admin routes
- [ ] Add permission checks to sensitive operations
- [ ] Standardize unauthorized and forbidden responses
- [ ] Write RBAC tests

## Week 5 Tasks

- [ ] Implement floor repository and service
- [ ] Add floor create, update, delete, list, and search endpoints
- [ ] Implement soft delete behavior
- [ ] Implement reservation repository and service
- [ ] Validate overlap, time, and floor existence rules
- [ ] Add reservation history and current reservation queries
- [ ] Test reservation conflict scenarios

## Week 6 Tasks

- [ ] Implement activity CRUD linked to reservations
- [ ] Add audit log entity persistence
- [ ] Record login, logout, register, floor, and reservation actions
- [ ] Add metadata and IP capture for audit events
- [ ] Test event logging and activity flows

## Week 7 Tasks

- [ ] Build occupancy metrics service
- [ ] Build reservation statistics service
- [ ] Add endpoints for daily, monthly, annual, and cancellation metrics
- [ ] Add peak hour and active user reports
- [ ] Return chart-friendly payloads for frontend graphs

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
