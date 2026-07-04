# 03 – Admin Frontend

## Overview

The **admin frontend** is a separate, protected React application that gives organisation administrators a full management workspace. It includes floor management with an interactive 2D floor builder, user management, reservation monitoring, analytics dashboards, audit logs, ratings, and settings.

**Location:** `admin-frontend/`  
**Entry point:** `admin-frontend/src/main.tsx`

---

## Technology Stack

Same core stack as the user frontend:

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI rendering |
| Vite | 8 | Build tool & dev server |
| TypeScript | 6 (strict) | Type-safe development |
| Material UI (MUI) | v9 | Component library & theming |
| TanStack React Query | v5 | Server state & data fetching |
| React Router DOM | v7 | Client-side routing |
| Axios | v1 | HTTP client |
| React Hook Form + Zod | v7 / v4 | Forms & validation |
| Vitest | v4 | Unit testing |

---

## Project Structure

```
admin-frontend/
└── src/
    ├── app/                            # App shell – routing, providers, theme
    │   ├── router.tsx                  # Admin route definitions
    │   ├── providers.tsx               # Global providers (QueryClient, theme)
    │   └── use-color-mode.ts           # Dark/light mode context
    ├── features/
    │   ├── auth/                       # Admin login & auth context
    │   └── admin-workspace/            # Main admin workspace feature
    │       ├── admin-workspace-page.tsx           # Root workspace page
    │       ├── admin-workspace-shell.tsx          # Sidebar + layout shell
    │       ├── admin-workspace-config.tsx         # Sidebar nav config
    │       ├── admin-workspace-sections-renderer.tsx  # Dynamic section renderer
    │       ├── admin-workspace-page-dialogs.tsx   # Global dialogs (create/edit/delete)
    │       ├── admin-workspace-types.ts           # Shared TypeScript types
    │       ├── admin-workspace-utils.tsx          # Data mapping utilities
    │       ├── admin-dialogs.tsx                  # Dialog state manager
    │       ├── utils.ts                           # General utilities
    │       ├── dialogs/                           # Per-entity dialog components
    │       └── sections/                          # All workspace section pages
    └── main.tsx
```

---

## Admin Workspace

The admin workspace is a **single-page shell** with a sidebar navigation. Each menu item renders a corresponding **section component**. All data mutations trigger dialogs (modal forms) for creating, editing, or deleting entities.

### Workspace Shell (`admin-workspace-shell.tsx`)

- Renders the persistent sidebar navigation and top header bar.
- Responsive: collapses to a drawer on mobile.
- Reads navigation config from `admin-workspace-config.tsx`.

### Navigation Sections

Configured in `admin-workspace-config.tsx`:

| Section Key | Component | Description |
|-------------|-----------|-------------|
| `dashboard` | `DashboardSection` | KPI cards, occupancy charts, recent activity |
| `floors` | `FloorManagementSection` | Floor CRUD + interactive floor builder |
| `organizations` | `OrganizationsSection` | Organisation management |
| `places` | `PlacesSection` | Place management per organisation |
| `users` | `UsersSection` | User listing, role management |
| `reservations` | `ReservationsSection` | View & manage all reservations |
| `requests` | `RequestsSection` | Contact request queue |
| `ratings` | `RatingsSection` | Admin & floor rating views |
| `logs` | `LogsSection` | Audit log viewer |
| `settings` | `SettingsSection` | Workspace settings |

---

## Sections In Detail

### `DashboardSection`
- Displays KPI cards: total floors, active reservations, total users, average ratings.
- Renders occupancy charts and a recent activity feed.
- Data fetched from `GET /api/v1/admin/workspace/dashboard`.

### `FloorManagementSection`
- Lists all floors belonging to the admin's organisation in a card grid.
- Each `FloorCard` shows floor name, capacity, status badge, and quick actions (Edit, Delete, Build).
- **Build** button opens the `FloorBuilderDialog`.

#### Floor Builder (`sections/floor-builder/`)
- A 2D canvas editor for designing floor layouts.
- Admins can drag and drop rooms, desks, walls, projectors, plants, and other equipment.
- Layouts are serialised as JSON and stored in the backend as `blueprint_image`.
- Key component: `FloorBuilderDialog` – full-screen dialog wrapping the canvas editor.

### `UsersSection`
- Full user table with search, filter by role, and pagination.
- Actions: Edit role, Deactivate, Delete user.
- Uses MUI `DataGrid` equivalent component.

### `ReservationsSection`
- Table of all reservations with status filtering (PENDING, CONFIRMED, CANCELLED, COMPLETED).
- Actions: Confirm, Cancel reservation.

### `RequestsSection`
- Incoming contact request queue from the public contact form.
- Actions: Mark as PROCESSED.

### `RatingsSection`
- Shows admin ratings and floor review listings.
- Sub-section split: admin ratings vs. floor reviews.

### `LogsSection`
- Displays the audit log for all sensitive admin actions.
- Filterable by action type and date range.

### `SettingsSection`
- Organisation-level settings (name, logo, description, etc.).

---

## Dialogs

Global dialogs are managed in `admin-workspace-page-dialogs.tsx` and opened via the dialog state in `admin-dialogs.tsx`.

| Dialog | Purpose |
|--------|---------|
| `CreateFloorDialog` | Form to create a new floor |
| `EditFloorDialog` | Form to edit an existing floor |
| `DeleteFloorDialog` | Confirmation dialog for floor deletion |
| `CreateUserDialog` | Form to add a new user |
| `EditUserDialog` | Form to update user details/role |
| `FloorBuilderDialog` | Full-screen interactive floor builder canvas |

---

## Available Scripts

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5174 by default)
npm run dev

# Type-check + production build
npm run build

# Run unit tests
npm run test

# Lint
npm run lint
```

---

*Next: [04-backend.md](./04-backend.md)*
