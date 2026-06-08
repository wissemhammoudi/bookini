# Task 2 Plan - Database Foundation

## Goal

Deliver Week 2 from the checklist:

- Define SQLAlchemy async base and database session handling
- Create models for users, floors, reservations, activities, and audit logs
- Define status and role enums
- Configure Alembic and create initial migration
- Verify table relationships and constraints

## Scope Boundaries

Included:

- Database setup and domain persistence models
- Schema migration pipeline with first migration
- Relationship and constraint validation

Excluded:

- Auth APIs and JWT flows (Week 3)
- RBAC route protection (Week 4)
- Reservation business workflows (Week 5)

## Implementation Sequence

### Step 1 - Add Data Dependencies

Add backend dependencies needed for persistence and migrations:

- SQLAlchemy async
- asyncpg
- Alembic

Deliverable:

- Updated backend dependency files with pinned versions

### Step 2 - Build Database Core Layer

Create shared DB infrastructure:

- Async engine builder
- Async session factory
- Declarative base and timestamp mixin
- Session dependency helper for later API use

Deliverable:

- Reusable DB core in infrastructure layer

### Step 3 - Finalize Persistent Enums

Promote existing enums to the canonical source for model fields and future API schemas:

- UserRole
- FloorStatus
- ReservationStatus

Deliverable:

- Enum definitions stable and ready for SQLAlchemy mapped columns

### Step 4 - Implement ORM Models

Implement all Week 2 entities:

- User
- Floor
- Reservation
- Activity
- AuditLog

For each model include:

- UUID primary key
- Required business fields from requirement spec
- created_at and updated_at where required
- Foreign keys and relationship directions
- Indexes for expected query paths

Deliverable:

- Complete SQLAlchemy model package

### Step 5 - Configure Alembic

Set up migration environment:

- Alembic configuration file
- env.py wiring to model metadata
- Async migration execution strategy

Deliverable:

- Alembic ready to autogenerate and run migrations

### Step 6 - Create Initial Migration

Generate and review first migration with:

- All five core tables
- Enum fields
- Constraints and indexes
- Foreign keys

Deliverable:

- Initial migration file committed and upgrade script verified

### Step 7 - Validate Relationships and Constraints

Run verification checks for:

- One-to-many links
- Nullability and uniqueness
- Soft-delete behavior on floors
- Reservation validity constraints supported by schema

Deliverable:

- Validation notes and any schema fixes

### Step 8 - Add Baseline DB Tests

Add minimum tests for:

- Model creation and relationship mapping
- Constraint enforcement
- Migration smoke path

Deliverable:

- Passing Week 2 data-layer test suite

## Planned File Targets

Core DB files:

- backend/app/infrastructure/database.py
- backend/app/infrastructure/session.py
- backend/app/infrastructure/base.py

Model files:

- backend/app/models/user.py
- backend/app/models/floor.py
- backend/app/models/reservation.py
- backend/app/models/activity.py
- backend/app/models/audit_log.py
- backend/app/models/__init__.py

Migration files:

- backend/alembic.ini
- backend/alembic/env.py
- backend/alembic/versions/0001_initial_schema.py

Test files:

- backend/tests/test_models.py
- backend/tests/test_migrations.py

## Acceptance Criteria

Task 2 is complete when all points below are true:

1. Async SQLAlchemy base and session management are in place.
2. All required Week 2 entities exist with expected fields.
3. Enums are consistent between domain and persistence.
4. Alembic is configured and can upgrade to head.
5. Initial migration creates full schema without manual edits at runtime.
6. Key relationships and constraints are verified by tests.

## Risks and Mitigations

Risk: Enum duplication between domain and model layer.
Mitigation: Keep domain enums as source of truth and reuse directly in model definitions.

Risk: Async Alembic configuration complexity.
Mitigation: Use standard async env setup and verify with a migration smoke test early.

Risk: Missing indexes causing slow queries later.
Mitigation: Add known lookup indexes now for user email, reservation time ranges, and floor filters.

## Suggested Delivery Split

Day 1:

- Dependencies
- DB core layer
- Enum finalization

Day 2:

- Models implementation
- Relationship wiring

Day 3:

- Alembic setup
- Initial migration
- Tests and fixes
