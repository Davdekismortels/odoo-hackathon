# Traveloop — Architecture

> System design reference for the Odoo Hackathon 2026.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / PWA                      │
│            React 18 + Vite + Tailwind CSS               │
│         TanStack Query · Zustand · React Router         │
└─────────────────────┬───────────────────────────────────┘
                      │  REST API (JSON)
                      │  Authorization: Bearer <JWT>
┌─────────────────────▼───────────────────────────────────┐
│                   Express API (Node 22)                  │
│           Routes → Controllers → Services →              │
│                    Repositories                          │
│                                                         │
│  Middleware stack:                                       │
│    Helmet · CORS · Rate-limit · Zod validate · Auth     │
└─────────────────────┬───────────────────────────────────┘
                      │  Drizzle ORM
┌─────────────────────▼───────────────────────────────────┐
│              SQLite (dev) / PostgreSQL+PostGIS (prod)   │
│                     15 tables · WAL mode                 │
└─────────────────────────────────────────────────────────┘
         │                              │
┌────────▼────────┐          ┌─────────▼─────────┐
│   Nominatim     │          │   REST Countries   │
│ (OSM geocoding) │          │  (country data)    │
│  cached in DB   │          │  cached in DB      │
└─────────────────┘          └───────────────────┘
```

---

## Layered Backend Architecture

| Layer | Responsibility | Example files |
|---|---|---|
| **Routes** | URL mapping, apply middleware | `auth.routes.ts` |
| **Controllers** | Parse HTTP req/res, call services | `auth.controller.ts` |
| **Services** | Business logic, orchestration | `auth.service.ts` |
| **Repositories** | All DB queries (no business logic) | `user.repository.ts` |
| **Middleware** | Cross-cutting: auth, validate, rate-limit | `auth.ts`, `validate.ts` |

**Rule:** controllers never touch the DB; repositories never contain business logic.

---

## Database Schema (15 tables)

```
users ──────────┬── trips ─────────┬── stops ────────┬── stop_activities ── activities
                │                  │                  │
                │                  ├── budget_entries │
                │                  ├── packing_items  │
                │                  ├── trip_notes     │
                │                  └── public_itineraries
                │
                ├── sessions (refresh tokens)
                ├── audit_logs
                └── saved_destinations ── cities ── countries
                                          │
                                     trip_clones
```

### Key design decisions
- **Soft deletes** on `users` and `trips` (`deleted_at` nullable timestamp)
- **Refresh token rotation** — each refresh revokes old session, issues new tokens
- **Audit log** for all auth events and destructive actions
- **SQLite WAL mode** — concurrent reads without blocking writes
- **Foreign keys enforced** via `PRAGMA foreign_keys = ON`

---

## Authentication Flow

```
Client                          API
  │                              │
  ├─POST /auth/signup ──────────►│ hash pw (bcrypt 12) → create user
  │◄── {accessToken, refreshToken}│   create session (hash stored)
  │                              │
  ├─GET /auth/me ───────────────►│ verify JWT → attach req.user
  │◄── {user}                    │
  │                              │
  ├─POST /auth/refresh ─────────►│ verify refresh token
  │◄── {accessToken, refreshToken}│   revoke old session → create new
  │                              │
  ├─POST /auth/logout ──────────►│ revoke all sessions for user
  │◄── {message}                 │
```

- **Access token**: JWT, 15 min TTL, sent as `Authorization: Bearer <token>`
- **Refresh token**: random hex, hashed with SHA-256 before DB storage
- **Rotation**: every refresh call invalidates the previous refresh token

---

## Frontend Architecture

```
pages/
  LoginPage, SignupPage, DashboardPage, TripListPage,
  TripDetailPage, BuilderPage, BudgetPage, PublicPage

features/  (co-locate related logic)
  auth/     → hooks, store slice, API calls
  trips/    → hooks, store slice, API calls
  builder/  → hooks, dnd logic, API calls
  budget/   → hooks, chart helpers, API calls

store/     Zustand slices (auth, ui, builder)
lib/       axios instance, TanStack Query client
```

**Data flow:** Pages → `useQuery` / `useMutation` (TanStack Query) → `lib/api.ts` → Express API → DB

---

## Security Controls

| Threat | Mitigation |
|---|---|
| Password breach | bcrypt rounds=12 |
| Token theft | Short-lived JWT (15 min) + httpOnly cookie fallback |
| Brute force | 10 req/15 min on `/auth` endpoints |
| CSRF | SameSite=Lax cookies |
| XSS | React auto-escaping + CSP via Helmet |
| SQL injection | Drizzle parameterizes all queries |
| IDOR | All controllers check `trip.userId === req.user.id` |
| DoS on OSM | 1 req/sec outbound throttle to Nominatim |

---

## OSM Caching Strategy

```
Client requests city "Paris"
        │
        ▼
DB lookup (cities table)
        │
   Found? ──YES──► Return cached result
        │
       NO
        │
        ▼
Nominatim API call
        │
        ▼
Save result to cities table (TTL 30 days)
        │
        ▼
Return to client
```

This makes the app **internet-independent** for demo day after initial warm-up.

---

## Performance Targets

| Metric | Target |
|---|---|
| API p95 response | < 100 ms (SQLite local) |
| Frontend bundle | < 200 KB gzip |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Time to Interactive | < 3 s on 4G |
