# 02 – Frontend (User Booking Portal)

## Overview

The **frontend** is the public-facing user booking portal that allows guests and registered users to browse available spaces, view interactive floor plans, and complete reservations — all without requiring an account.

**Location:** `frontend/`  
**Entry point:** `frontend/src/main.tsx`

---

## Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI rendering |
| Vite | 8 | Build tool & dev server |
| TypeScript | 6 (strict) | Type-safe development |
| Material UI (MUI) | v9 | Component library & theming |
| TanStack React Query | v5 | Server state management & caching |
| React Router DOM | v7 | Client-side routing |
| Axios | v1 | HTTP API client |
| React Hook Form | v7 | Form state management |
| Zod | v4 | Schema validation |
| Vitest | v4 | Unit testing |
| @testing-library/react | v16 | Component testing |
| ESLint | v10 | Linting |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # App shell – router, providers, theme, color mode
│   │   ├── router.tsx              # React Router route definitions
│   │   ├── providers.tsx           # QueryClient, theme, auth providers
│   │   └── use-color-mode.ts       # Dark/light mode context
│   ├── assets/                     # Static assets (images, SVGs)
│   ├── features/                   # Feature-based modules
│   │   ├── auth/                   # Authentication feature
│   │   ├── bookings/               # Booking flow feature
│   │   └── public/                 # Public pages (landing, contact, about)
│   ├── lib/                        # Shared utilities & API client
│   ├── pages/                      # Top-level page components (thin wrappers)
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Application entry point
├── index.html                      # HTML shell
├── vite.config.ts                  # Vite configuration
├── tsconfig.app.json               # TypeScript config
└── package.json                    # Dependencies & scripts
```

---

## Feature Modules

### `features/auth/` – Authentication

Handles user registration, login, password reset, and profile management.

| File | Description |
|------|-------------|
| `auth-context.tsx` | React context providing `user`, `login()`, `logout()` to the whole app |
| `auth-context-object.ts` | TypeScript interface for the auth context value |
| `auth-storage.ts` | LocalStorage helpers for JWT access/refresh tokens |
| `hooks.ts` | `useAuth()` – convenience hook to consume the auth context |
| `login-page.tsx` | Login form page with email/password fields |
| `register-page.tsx` | Registration form page |
| `forgot-password-page.tsx` | Multi-step password reset flow (request → confirm → success) |
| `profile-page.tsx` | Authenticated user profile & avatar upload page |
| `components/` | Sub-components: `AuthBranding`, `ThemeToggle`, `RequestPasswordResetForm`, `ConfirmPasswordResetForm`, `ResetPasswordSuccess` |

**Auth Flow:**
```
User visits /login
  → LoginPage calls POST /api/v1/auth/login
  → Tokens stored via auth-storage.ts
  → AuthContext updated with user info
  → Redirected to home
```

---

### `features/bookings/` – Booking Flow

The core booking experience: browsing places, selecting floors, picking time slots, and confirming a reservation.

| File | Description |
|------|-------------|
| `types.ts` | TypeScript types for rooms, floors, bookings |
| `constants.ts` | Shared constants (time slots, booking types, etc.) |
| `hooks.ts` | Custom hooks: `usePublicRooms`, `useCreateBooking`, `useCalendarSlots` |
| `place-details-page.tsx` | Place detail view with floor plan selector |
| `floor-details-page.tsx` | Floor detail view with interactive room/area selector |
| `floor-details-utils.ts` | Helpers for resolving blueprint layout data |
| `public-booking-page.tsx` | Full booking form – guest info, time, date, pricing |
| `booking-confirmation-page.tsx` | Post-booking confirmation & booking reference display |
| `components/` | Reusable booking UI components |
| `index.ts` | Public exports for the feature |

**Booking Flow:**
```
Landing Page → Place Details → Floor Details → Public Booking Form → Confirmation
```

---

### `features/public/` – Public Pages

Static and semi-dynamic public pages for marketing and contact.

| File | Description |
|------|-------------|
| `landing-page.tsx` | Home page – hero section, features, call-to-action |
| `landing-page-data.tsx` | Data/content for the landing page sections |
| `about-page.tsx` | About the platform |
| `about-page-data.tsx` | Content data for the about page |
| `contact-page.tsx` | Contact form – submits to `POST /api/v1/public/contact-requests` |
| `admin-profile-page.tsx` | Public admin profile view (ratings, reviews) |
| `reservations-info-page.tsx` | Info page for the reservations system |
| `reservations-info-data.tsx` | Content data for reservations info page |
| `components/` | Shared public components (e.g., `PublicFooter`, `PublicHeader`) |

---

## Routing

Routes are defined in `src/app/router.tsx`:

| Path | Component | Auth Required |
|------|-----------|:---:|
| `/` | `LandingPage` | No |
| `/about` | `AboutPage` | No |
| `/contact` | `ContactPage` | No |
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/forgot-password` | `ForgotPasswordPage` | No |
| `/profile` | `ProfilePage` | Yes |
| `/places/:id` | `PlaceDetailsPage` | No |
| `/floors/:id` | `FloorDetailsPage` | No |
| `/book` | `PublicBookingPage` | No |
| `/booking-confirmation` | `BookingConfirmationPage` | No |

---

## Theming & Styling

- **Light/Dark mode** toggled via `useColorMode()` context – stored in `localStorage`.
- MUI theme configured in `src/app/providers.tsx` with a custom color palette.
- Global baseline styles in `src/index.css`.
- Component-level styles use MUI's `sx` prop with responsive breakpoints.
- Dynamic backgrounds use linear-gradient CSS depending on the active mode:
  - **Light:** `linear-gradient(135deg, #f5f7fb 0%, #e4ecfa 100%)`
  - **Dark:** `linear-gradient(135deg, #090e17 0%, #121e33 100%)`

---

## Available Scripts

```bash
# Install dependencies
npm install

# Start the development server (hot-reload on http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Run unit tests (single pass, with coverage)
npm run test

# Run tests in watch mode
npm run test:watch

# Lint source code
npm run lint

# Preview production build locally
npm run preview
```

---

## Testing

- **Framework:** Vitest + `@testing-library/react` + `jsdom`
- Tests live alongside components in `*.test.tsx` files.
- Coverage collected via `@vitest/coverage-v8`.

**Key test files:**
- `src/features/auth/auth-context.test.tsx` – Auth context provider tests
- `src/features/auth/login-page.test.tsx` – Login form interaction tests

**Run with coverage:**
```bash
npm run test
```

---

*Next: [03-admin-frontend.md](./03-admin-frontend.md)*
