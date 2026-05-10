# 📘 TRAVELOOP — Product Requirements Document (PRD)

### _Personalized Travel Planning, Reimagined_

**Project Codename:** Traveloop  
**Hackathon:** Odoo Hackathon 2026  
**Document Version:** 1.0 (Final, Master PRD)  
**Document Owner:** Product & Engineering Team  
**Last Updated:** May 10, 2026  
**Status:** APPROVED FOR BUILD

---

## 📑 TABLE OF CONTENTS

1. Executive Summary
2. Vision, Mission & North-Star Metric
3. Problem Statement & Market Opportunity
4. Target Users & Personas
5. User Journeys & Stories
6. Differentiators ("Why Traveloop Wins")
7. Tech Stack (Justified)
8. System Architecture
9. Database Design (Full ER + DDL)
10. Backend API Specification
11. Frontend Specification (Screen-by-Screen)
12. Design System (UI/UX)
13. Core Algorithms (Budget, Recommendation, Routing)
14. Security & Input Validation
15. Performance, Caching & Scalability
16. Testing Strategy
17. DevOps, Git Workflow & CI/CD
18. Folder Structure
19. Sprint Plan & Task Allocation
20. Demo Script & Pitch Strategy
21. Risk Register
22. Future Roadmap
23. Appendix (Validation Rules, Error Codes, Glossary)

---

## 1. EXECUTIVE SUMMARY

Traveloop is an end-to-end, full-stack travel planning web application that lets users dream, design, budget, visualize, and share multi-city trips through a single, beautifully crafted interface. Unlike legacy planners (TripIt, Wanderlog) that focus on bookings, Traveloop is a **planning-first, intelligence-first** platform: it builds itineraries day-by-day, computes budgets in real time, suggests cities/activities from live OpenStreetMap data, and offers a public "Trip Gallery" where users can clone and remix others' itineraries — all without depending on paid third-party services.

The product is built on a **PostgreSQL + Node.js (Express + TypeScript) + React 18 + Vite + TailwindCSS + shadcn/ui** stack, with **Drizzle ORM** for type-safe SQL, **Zod** for end-to-end validation, **JWT + bcrypt** for security, and **OpenStreetMap (Nominatim + Overpass API)** as the only external data source — all of which are free, self-hostable, and outage-resilient.

**Why we win:** Traveloop checks every Odoo evaluation box — strong relational DB design (15 normalized tables, indexed, with PostGIS), modular architecture (clean layered backend, atomic frontend components), zero blind copy-paste (every line is owned by the team), real dynamic data, robust validation (Zod schemas mirror DB constraints), and a polished, responsive UI that works offline-first via service workers.

---

## 2. VISION, MISSION & NORTH-STAR METRIC

**Vision.** A world where planning a trip is as joyful as taking it — where every traveler, regardless of budget or experience, can craft a personalized journey in minutes and share it with the world.

**Mission (Hackathon Scope).** To deliver, within 48 hours, a production-grade, fully responsive web application that lets a user: sign up → create a multi-city trip → add stops, dates, and activities → see real-time cost breakdowns → manage a packing list and notes → publish a shareable public itinerary — all backed by a properly normalized PostgreSQL schema and a clean modular codebase.

**North-Star Metric (for demo).** _"Time-to-first-itinerary"_ — a new user can sign up and produce a complete 3-city, 7-day budgeted itinerary in **under 4 minutes**.

**Secondary KPIs.**

- 100% of forms validated client- and server-side
- < 200 ms median API latency on local Postgres
- Lighthouse score ≥ 95 on Performance, Accessibility, Best Practices
- 0 critical/high security findings on `npm audit`
- ≥ 80% backend code coverage on unit + integration tests

---

## 3. PROBLEM STATEMENT & MARKET OPPORTUNITY

Travelers today juggle 6–8 tools to plan one trip: Google Docs for ideas, Excel for budget, Google Maps for routes, WhatsApp for sharing, Booking.com for stays, and Notes for packing. The fragmentation causes:

- **Decision fatigue** — too many tabs, no single source of truth.
- **Budget blowouts** — costs are tracked manually and discovered post-trip.
- **Lost inspiration** — friends' trips live in screenshots, not searchable artifacts.
- **No collaboration** — group trips devolve into chat threads.

Traveloop unifies all of this in one relational, dynamic, shareable workspace.

**Market signal.** The global travel-planning software market was valued at ~$11B in 2025 and is projected to grow at a 10% CAGR (Statista, Grand View Research). Gen-Z + Millennial travelers explicitly prefer DIY, social, budget-aware tools over packaged tours.

---

## 4. TARGET USERS & PERSONAS

**Persona 1 — "Aanya, the Solo Backpacker" (22, student).** Limited budget, plans 2–3-week multi-country trips, obsessively tracks spending, gets inspiration from Instagram and Reddit. Needs: budget alerts, public-itinerary cloning, packing checklist.

**Persona 2 — "Rohan & Priya, the Couple" (29, working professionals).** Plan 1–2 trips/year, value aesthetics and shared planning, willing to spend mid-range. Needs: collaborative editing (post-MVP), beautiful timeline view, curated activities.

**Persona 3 — "The Sharma Family" (parents + 2 kids).** Plan family vacations, need detailed schedules, kid-friendly activities, and printable itineraries. Needs: notes per stop, packing checklist with categories, calendar view.

**Persona 4 — "Admin / Platform Operator."** Monitors usage, top destinations, content moderation. Needs: analytics dashboard, user management.

---

## 5. USER JOURNEYS & USER STORIES

### 5.1 Primary Happy Path (Aanya plans a Europe trip)

1. Lands on marketing landing page → clicks **Sign Up**.
2. Registers with email + password → JWT issued → redirected to **Dashboard**.
3. Clicks **"Plan New Trip"** → fills form (name: "Euro Summer", dates, cover photo) → trip created.
4. Enters **Itinerary Builder** → searches "Paris" (Nominatim hit) → adds as Stop 1 with dates → adds activities (Eiffel Tower, Louvre) from Overpass API.
5. Repeats for Amsterdam, Rome.
6. Switches to **Itinerary View** → sees Gantt-style timeline.
7. Opens **Budget Screen** → sees pie chart: Stay 45%, Activities 25%, Transport 20%, Meals 10% — total ₹85,000. One day flagged red (over budget).
8. Opens **Packing Checklist** → ticks items, adds "passport copy" under Documents.
9. Adds a **Note** to Paris stop: "Hotel check-in code 4521".
10. Clicks **Publish** → public URL generated → copies to share on Reddit.

### 5.2 Core User Stories (excerpt — full list in Appendix C)

| ID    | As a...  | I want to...                               | So that...               | Priority |
| ----- | -------- | ------------------------------------------ | ------------------------ | -------- |
| US-01 | New user | sign up with email/password                | I can save my trips      | P0       |
| US-02 | User     | create a new trip with dates               | I begin planning         | P0       |
| US-03 | User     | add multiple cities (stops) to a trip      | I plan multi-city travel | P0       |
| US-04 | User     | search cities via a search bar             | I discover destinations  | P0       |
| US-05 | User     | assign activities to each stop             | my plan is detailed      | P0       |
| US-06 | User     | see a real-time cost breakdown             | I stay on budget         | P0       |
| US-07 | User     | view trip on a calendar/timeline           | I visualize the journey  | P0       |
| US-08 | User     | maintain a packing checklist               | I don't forget items     | P0       |
| US-09 | User     | write notes per trip/stop                  | I capture details        | P0       |
| US-10 | User     | publish a read-only public link            | friends can view         | P0       |
| US-11 | User     | clone another user's public trip           | I get inspired fast      | P1       |
| US-12 | User     | edit my profile and avatar                 | personalization          | P1       |
| US-13 | Admin    | see top cities/activities & user stats     | I monitor platform       | P1       |
| US-14 | User     | reorder stops via drag-drop                | planning is flexible     | P1       |
| US-15 | User     | use the app offline (service-worker cache) | I plan on flights        | P2       |

---

## 6. DIFFERENTIATORS — "WHY TRAVELOOP WINS THE HACKATHON"

These are the seven moves that map directly to Odoo's stated evaluation criteria:

**6.1 Database design as a feature, not an afterthought.** A 15-table normalized PostgreSQL schema with PostGIS for geo-queries, partial indexes, generated columns, full-text search via `tsvector`, soft deletes via `deleted_at`, and audit timestamps. We will showcase the ER diagram in the demo.

**6.2 Zero reliance on cloud/paid services.** No Firebase, Supabase, Mongo Atlas, Google Maps, or paid APIs. We use a locally hosted PostgreSQL, OpenStreetMap (Nominatim/Overpass — free, no key), and REST Countries (free, no key) — and we cache all external responses in our own DB so the app keeps working if the internet dies mid-demo.

**6.3 End-to-end type safety and validation.** Zod schemas live in a shared `packages/shared` workspace and are used by both the React client and the Express server, guaranteeing client and server validate identical rules. DB constraints mirror Zod rules. This is bulletproof "robust input validation".

**6.4 Modular layered backend.** Routes → Controllers → Services → Repositories → DB. Each layer is unit-testable in isolation. No God-files. This directly addresses "modular architecture and coding patterns".

**6.5 Component-driven, design-tokenized frontend.** Atomic Design (atoms → molecules → organisms → pages), every component documented in Storybook, design tokens in a single `tokens.ts`, and a single source of truth for color/typography/spacing. Lighthouse-audited.

**6.6 AI used _with purpose_, not for show.** A single, focused AI feature — **"Smart Itinerary Generator"** — uses a local rule-based engine (no external LLM dependency) that takes (destination, days, interests, budget) and produces a draft itinerary. It's deterministic, explainable, and demoable offline. (Optional toggle: integrate a local Ollama model if a teammate has it running; never required.)

**6.7 Real Git hygiene.** Conventional Commits, GitHub Flow with PRs, branch protection, every team member has merged commits, CHANGELOG.md auto-generated, semantic versioning, signed commits where possible. Judges _will_ check the repo — this matters.

---

## 7. TECH STACK (WITH JUSTIFICATIONS)

Every choice below is selected to maximize Odoo's stated criteria: relational DB, no-cloud, modular, performant, secure, debuggable.

### 7.1 Frontend

| Layer      | Tool                                    | Why this, not alternatives                                                                     |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Framework  | **React 18 + Vite**                     | Fastest dev server (HMR < 50ms), no Next.js coupling, easy to deploy as static.                |
| Language   | **TypeScript 5.4**                      | Catches 80% of bugs at compile time; required for type-safe APIs.                              |
| Styling    | **Tailwind CSS 3.4 + shadcn/ui**        | shadcn copies components into your repo (no NPM lock-in, no bundle bloat); fully customizable. |
| State      | **Zustand** + **TanStack Query v5**     | Zustand for UI state (4kb); TanStack Query for server state, caching, optimistic updates.      |
| Forms      | **React Hook Form + Zod resolver**      | Performant, schema-driven, mirrors backend validation.                                         |
| Routing    | **React Router v6**                     | Battle-tested, nested routes, data-loaders.                                                    |
| Charts     | **Recharts**                            | Lightweight, declarative, no D3 learning curve.                                                |
| Maps       | **Leaflet + react-leaflet** + OSM tiles | Free, no API key, works offline with cached tiles.                                             |
| Drag-Drop  | **dnd-kit**                             | Modern, accessible, replaces deprecated react-beautiful-dnd.                                   |
| Icons      | **Lucide React**                        | 1,400+ icons, tree-shakeable.                                                                  |
| Animations | **Framer Motion**                       | For polished transitions on demo day.                                                          |
| PWA        | **vite-plugin-pwa**                     | Service-worker, offline support — addresses "offline" nice-to-have.                            |

### 7.2 Backend

| Layer      | Tool                                                             | Justification                                                                                          |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Runtime    | **Node.js 20 LTS**                                               | Stable, fast, ubiquitous.                                                                              |
| Framework  | **Express 4 + TypeScript**                                       | Minimal, well-understood, easy to debug live. (NestJS rejected: too heavy for 48h.)                    |
| ORM        | **Drizzle ORM**                                                  | Type-safe, SQL-first, 0-runtime overhead, no codegen tantrums (Prisma rejected: deploy issues, heavy). |
| Validation | **Zod**                                                          | Shared schemas with frontend.                                                                          |
| Auth       | **bcrypt (12 rounds)** + **jsonwebtoken** + **httpOnly cookies** | Industry standard.                                                                                     |
| Logging    | **Pino**                                                         | Structured JSON logs, fast.                                                                            |
| Rate limit | **express-rate-limit** + **helmet**                              | Security baseline.                                                                                     |
| Testing    | **Vitest** + **Supertest**                                       | Fast, ESM-native.                                                                                      |
| Migrations | **Drizzle Kit**                                                  | First-class with Drizzle.                                                                              |
| Cache      | **Node-cache (in-memory)** for OSM responses                     | No Redis needed locally.                                                                               |

### 7.3 Database

- **PostgreSQL 16** (local, Dockerized).
- **PostGIS** extension for geo queries (nearest-cities, distance, bounding-box).
- **pg_trgm** for fuzzy city/activity search.
- **uuid-ossp** for UUID PKs.

### 7.4 External Data Sources (all free, no key)

- **Nominatim** (`https://nominatim.openstreetmap.org`) — geocoding cities. Cached to DB on first lookup.
- **Overpass API** (`https://overpass-api.de/api/interpreter`) — `tourism=*`, `amenity=restaurant`, etc. for activities. Cached.
- **REST Countries** (`https://restcountries.com/v3.1/all`) — country metadata, currencies, flags. Cached on app boot.
- **OSM tile server** for Leaflet maps.

### 7.5 DevOps

- **Docker Compose** — one-command local stack (`postgres`, `api`, `web`).
- **GitHub Actions** — lint, typecheck, test on every PR.
- **pnpm workspaces** — monorepo (`apps/web`, `apps/api`, `packages/shared`).
- **ESLint + Prettier + Husky + lint-staged** — pre-commit hooks.

---

## 8. SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                          │
│   React 18 + Vite + Tailwind + shadcn/ui + Zustand + TanStack │
│   Service Worker (offline cache)   |   Leaflet (OSM tiles)    │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTPS / JSON  /  JWT (httpOnly)
┌──────────────────────────▼───────────────────────────────────┐
│                   Express API (Node 20, TS)                   │
│  Layer:  Routes → Controllers → Services → Repositories      │
│  Cross-cuts: helmet, CORS, rate-limit, Pino logger, Zod      │
└──────┬─────────────────────┬───────────────────┬─────────────┘
       │                     │                   │
       │ Drizzle ORM         │ HTTP cache        │ HTTP cache
       │                     │                   │
┌──────▼──────┐      ┌───────▼─────┐      ┌──────▼──────┐
│ PostgreSQL  │      │  Nominatim  │      │  Overpass   │
│ + PostGIS   │      │   (OSM)     │      │   (OSM)     │
│  (local)    │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Layering rules.**

- **Routes** — define HTTP verbs/paths only.
- **Controllers** — validate input via Zod, call services, format response.
- **Services** — business logic (e.g., `calculateBudget`, `cloneTrip`); never touch HTTP or DB drivers directly.
- **Repositories** — only file allowed to import Drizzle.
- **Shared types** in `packages/shared` so client and server cannot drift.

---

## 9. DATABASE DESIGN

### 9.1 Entity-Relationship Overview

```
users ──< trips ──< stops ──< stop_activities >── activities
  │         │         │
  │         │         └──< notes
  │         │
  │         ├──< trip_collaborators (post-MVP)
  │         ├──< packing_items
  │         ├──< trip_notes
  │         └──< budget_entries
  │
  └──< saved_destinations

cities ──< activities
countries ──< cities
public_itineraries ──> trips
audit_logs (cross-cutting)
```

### 9.2 Tables (15 total)

1. **users** — auth & profile
2. **countries** — seeded from REST Countries
3. **cities** — cached from Nominatim, geo-indexed
4. **activities** — cached from Overpass + user-submitted
5. **trips** — top-level trip
6. **stops** — a city visit within a trip (with arrival/departure)
7. **stop_activities** — junction: which activities at which stop
8. **budget_entries** — line-item costs (transport/stay/meals/activity/misc)
9. **packing_items** — per-trip checklist
10. **trip_notes** — markdown notes per trip or stop
11. **public_itineraries** — public share metadata (slug, view count)
12. **saved_destinations** — user's wishlist of cities
13. **trip_clones** — analytics: who cloned what
14. **audit_logs** — admin/security trail
15. **sessions** — refresh-token store (JWT rotation)

### 9.3 Full DDL (PostgreSQL 16)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ===== USERS =====
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           CITEXT UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(120) NOT NULL,
  avatar_url      TEXT,
  language        VARCHAR(10) DEFAULT 'en',
  role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- ===== COUNTRIES =====
CREATE TABLE countries (
  code            CHAR(2) PRIMARY KEY,        -- ISO 3166-1 alpha-2
  name            VARCHAR(100) NOT NULL,
  currency_code   CHAR(3) NOT NULL,
  currency_symbol VARCHAR(5),
  flag_emoji      VARCHAR(10),
  region          VARCHAR(50),
  cost_index      NUMERIC(4,2)                -- our derived cost-of-travel index 0–10
);

-- ===== CITIES =====
CREATE TABLE cities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  country_code    CHAR(2) REFERENCES countries(code),
  geom            GEOGRAPHY(Point, 4326) NOT NULL,
  osm_id          BIGINT,                     -- traceability
  population      INTEGER,
  popularity      INTEGER DEFAULT 0,          -- view counts
  cost_index      NUMERIC(4,2),
  description     TEXT,
  image_url       TEXT,
  search_vector   TSVECTOR GENERATED ALWAYS AS
                   (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))) STORED,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cities_geom ON cities USING GIST (geom);
CREATE INDEX idx_cities_search ON cities USING GIN (search_vector);
CREATE INDEX idx_cities_name_trgm ON cities USING GIN (name gin_trgm_ops);
CREATE UNIQUE INDEX uq_city_country_name ON cities(name, country_code);

-- ===== ACTIVITIES =====
CREATE TABLE activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id         UUID REFERENCES cities(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  category        VARCHAR(50) NOT NULL CHECK
                   (category IN ('sightseeing','food','adventure','culture','nightlife','shopping','nature','other')),
  description     TEXT,
  estimated_cost  NUMERIC(10,2) DEFAULT 0,    -- in USD; UI converts
  duration_min    INTEGER DEFAULT 60,
  geom            GEOGRAPHY(Point, 4326),
  osm_id          BIGINT,
  image_url       TEXT,
  source          VARCHAR(20) DEFAULT 'osm' CHECK (source IN ('osm','user','seed')),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_city ON activities(city_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_name_trgm ON activities USING GIN (name gin_trgm_ops);

-- ===== TRIPS =====
CREATE TABLE trips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  cover_image_url TEXT,
  budget_limit    NUMERIC(12,2),
  currency_code   CHAR(3) DEFAULT 'USD',
  is_public       BOOLEAN DEFAULT FALSE,
  status          VARCHAR(20) DEFAULT 'planning'
                   CHECK (status IN ('planning','booked','completed','archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT date_range CHECK (end_date >= start_date),
  CONSTRAINT trip_max_days CHECK (end_date - start_date <= 365)
);
CREATE INDEX idx_trips_user ON trips(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trips_public ON trips(is_public) WHERE is_public = TRUE;

-- ===== STOPS =====
CREATE TABLE stops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id         UUID NOT NULL REFERENCES cities(id),
  arrival_date    DATE NOT NULL,
  departure_date  DATE NOT NULL,
  order_index     INTEGER NOT NULL,
  accommodation   VARCHAR(200),
  accommodation_cost NUMERIC(10,2) DEFAULT 0,
  transport_cost  NUMERIC(10,2) DEFAULT 0,    -- to reach this stop
  meal_cost_per_day NUMERIC(10,2) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT stop_dates CHECK (departure_date >= arrival_date)
);
CREATE INDEX idx_stops_trip ON stops(trip_id, order_index);

-- ===== STOP_ACTIVITIES (junction) =====
CREATE TABLE stop_activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stop_id         UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  activity_id     UUID NOT NULL REFERENCES activities(id),
  scheduled_date  DATE,
  scheduled_time  TIME,
  custom_cost     NUMERIC(10,2),              -- override default activity cost
  notes           TEXT,
  order_index     INTEGER DEFAULT 0,
  UNIQUE (stop_id, activity_id, scheduled_date)
);
CREATE INDEX idx_stop_act_stop ON stop_activities(stop_id);

-- ===== BUDGET_ENTRIES =====
CREATE TABLE budget_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  stop_id         UUID REFERENCES stops(id) ON DELETE CASCADE,
  category        VARCHAR(20) NOT NULL CHECK
                   (category IN ('transport','stay','meals','activity','shopping','misc')),
  amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency_code   CHAR(3) DEFAULT 'USD',
  description     VARCHAR(255),
  entry_date      DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_budget_trip ON budget_entries(trip_id);

-- ===== PACKING_ITEMS =====
CREATE TABLE packing_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  category        VARCHAR(30) DEFAULT 'misc' CHECK
                   (category IN ('clothing','documents','electronics','toiletries','medication','misc')),
  is_packed       BOOLEAN DEFAULT FALSE,
  quantity        INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_packing_trip ON packing_items(trip_id);

-- ===== TRIP_NOTES =====
CREATE TABLE trip_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  stop_id         UUID REFERENCES stops(id) ON DELETE CASCADE,
  title           VARCHAR(150),
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notes_trip ON trip_notes(trip_id);

-- ===== PUBLIC_ITINERARIES =====
CREATE TABLE public_itineraries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  slug            VARCHAR(60) UNIQUE NOT NULL,
  view_count      INTEGER DEFAULT 0,
  clone_count     INTEGER DEFAULT 0,
  published_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_public_slug ON public_itineraries(slug);

-- ===== SAVED_DESTINATIONS =====
CREATE TABLE saved_destinations (
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  city_id         UUID REFERENCES cities(id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, city_id)
);

-- ===== TRIP_CLONES (analytics) =====
CREATE TABLE trip_clones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_trip_id  UUID NOT NULL REFERENCES trips(id),
  cloned_trip_id  UUID NOT NULL REFERENCES trips(id),
  cloned_by       UUID NOT NULL REFERENCES users(id),
  cloned_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ===== SESSIONS (refresh tokens) =====
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  user_agent      TEXT,
  ip_address      INET,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ===== AUDIT_LOGS =====
CREATE TABLE audit_logs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(50) NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  metadata        JSONB,
  ip_address      INET,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_trips_updated BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON trip_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 9.4 Sample geo-query (showcase to judges)

```sql
-- "Find 10 cities within 500 km of Paris, ordered by popularity"
SELECT c.name, c.country_code,
       ST_Distance(c.geom, (SELECT geom FROM cities WHERE name='Paris'))/1000 AS km
FROM cities c
WHERE ST_DWithin(c.geom, (SELECT geom FROM cities WHERE name='Paris'), 500000)
  AND c.name <> 'Paris'
ORDER BY c.popularity DESC
LIMIT 10;
```

---

## 10. BACKEND API SPECIFICATION

**Base URL:** `/api/v1` · **Auth:** JWT in `httpOnly` cookie (`access_token` 15 min) + `refresh_token` (7 d, rotated).  
**All responses** follow `{ success: boolean, data?: T, error?: { code, message, details } }`.

### 10.1 Auth

| Method | Path                    | Body                          | Response              |
| ------ | ----------------------- | ----------------------------- | --------------------- |
| POST   | `/auth/signup`          | `{email, password, fullName}` | `{user, accessToken}` |
| POST   | `/auth/login`           | `{email, password}`           | `{user, accessToken}` |
| POST   | `/auth/refresh`         | (cookie)                      | `{accessToken}`       |
| POST   | `/auth/logout`          | (cookie)                      | `{success:true}`      |
| POST   | `/auth/forgot-password` | `{email}`                     | `{success:true}`      |
| GET    | `/auth/me`              | —                             | `{user}`              |

### 10.2 Trips

| Method | Path                   | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| GET    | `/trips`               | List my trips (paginated, filter by status). |
| POST   | `/trips`               | Create trip.                                 |
| GET    | `/trips/:id`           | Get trip with stops, activities, budget.     |
| PATCH  | `/trips/:id`           | Update trip.                                 |
| DELETE | `/trips/:id`           | Soft delete.                                 |
| POST   | `/trips/:id/publish`   | Generate public slug.                        |
| POST   | `/trips/:id/unpublish` | Revoke share.                                |
| POST   | `/trips/:id/clone`     | Clone (must be public or owned).             |

### 10.3 Stops & Activities

| POST | `/trips/:id/stops` | Add a city stop. |
| PATCH | `/stops/:id` | Update dates / costs. |
| DELETE | `/stops/:id` | Remove stop. |
| PATCH | `/trips/:id/stops/reorder` | Body: `[{id, order_index}]` |
| POST | `/stops/:id/activities` | Attach activity to stop. |
| DELETE | `/stop-activities/:id` | Detach. |

### 10.4 Search

| GET | `/search/cities?q=&country=&limit=20` | Search cities (DB first, Nominatim fallback). |
| GET | `/search/activities?cityId=&category=&maxCost=` | Search activities (DB + Overpass). |
| GET | `/cities/:id/nearby?radius=300` | PostGIS geo-query. |

### 10.5 Budget

| GET | `/trips/:id/budget` | Returns `{ total, byCategory, byDay, overBudgetDays }` — computed live. |
| POST | `/trips/:id/budget-entries` | Add line item. |
| DELETE | `/budget-entries/:id` | Remove line. |

### 10.6 Packing & Notes

| GET / POST / PATCH / DELETE | `/trips/:id/packing` | CRUD. |
| GET / POST / PATCH / DELETE | `/trips/:id/notes` | CRUD. |

### 10.7 Public

| GET | `/public/:slug` | Read-only itinerary. Increments `view_count`. |
| GET | `/public` | Trending public itineraries. |

### 10.8 Admin (role:'admin')

| GET | `/admin/stats` | Users, trips, top cities. |
| GET | `/admin/users` | List/search/disable users. |

### 10.9 Example: Create Trip — Full Cycle

**Request:**

```http
POST /api/v1/trips
Authorization: Bearer <access>
Content-Type: application/json

{
  "name": "Euro Summer 2026",
  "startDate": "2026-06-15",
  "endDate": "2026-06-29",
  "description": "Backpacking trip",
  "budgetLimit": 100000,
  "currencyCode": "INR"
}
```

**Zod schema (shared):**

```ts
export const createTripSchema = z
  .object({
    name: z.string().min(3).max(150),
    startDate: z.string().date(),
    endDate: z.string().date(),
    description: z.string().max(2000).optional(),
    budgetLimit: z.number().positive().max(1e9).optional(),
    currencyCode: z.string().length(3).default("USD"),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });
```

**Response 201:**

```json
{ "success": true, "data": { "id":"...", "name":"Euro Summer 2026", ... } }
```

**Errors:** `400 VALIDATION_ERROR` (with `details: ZodIssue[]`), `401 UNAUTHORIZED`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR` (no stack trace leaked).

---

## 11. FRONTEND SPECIFICATION — SCREEN BY SCREEN

Every screen is described with: route, components used, state, validations, edge cases, accessibility notes.

### 11.1 Login / Signup (`/login`, `/signup`)

- **Components:** `<AuthLayout>`, `<AuthForm>`, `<PasswordField>` (with show/hide toggle + strength meter), `<OAuthBanner>` (placeholder).
- **Validation:** email regex, password min 8 chars + 1 uppercase + 1 number + 1 symbol (Zod-enforced).
- **Edge cases:** duplicate email → inline error; rate-limited → toast; network failure → retry button.
- **A11y:** all inputs have `<label>`, errors announced via `aria-live="polite"`.

### 11.2 Dashboard (`/`)

- **Components:** `<TopNav>`, `<HeroGreeting>` (time-aware: "Good evening, Aanya"), `<UpcomingTripCard>` carousel, `<QuickStats>` (trips, countries visited, total budget), `<TrendingDestinations>`, `<NewTripCTA>`.
- **Data:** `GET /trips?status=planning&limit=5` + `GET /public?limit=8`.
- **Empty state:** illustration + "Plan your first trip" button.

### 11.3 Create Trip (`/trips/new`)

- **Modal or page** with multi-step form: Step 1 (basics), Step 2 (dates with calendar picker), Step 3 (cover image upload + budget).
- **Image upload** — local (multer + filesystem); store `/uploads/trips/<uuid>.webp`; client-side resize via `browser-image-compression`.

### 11.4 My Trips (`/trips`)

- Grid of `<TripCard>` (cover image, name, date range, country flags, status pill).
- **Filters:** status tabs (Planning / Upcoming / Completed / Archived), search bar, sort by date / name / cost.
- **Actions:** quick edit (pencil), duplicate, delete (soft, with undo toast for 5 s).

### 11.5 Itinerary Builder (`/trips/:id/builder`) — **Star of the show**

- **Layout:** 3-pane: Left = stops list (drag-drop via dnd-kit), Center = day-grid + activity blocks, Right = inspector (selected stop / activity details).
- **Add Stop:** searchable autocomplete (debounced `GET /search/cities?q=`); click result → modal "When are you there?" → adds to grid.
- **Add Activity:** in inspector, list activities for the stop's city; "+ Custom activity" allows user-defined.
- **Drag-drop:** reorder stops; reorder activities within a day; drop a city onto another day to swap.
- **Conflict detection:** if stop dates overlap → red border + tooltip "Dates conflict with Paris (Jun 18–21)".
- **Auto-save** every 2 s (debounced) with offline queue.

### 11.6 Itinerary View (`/trips/:id`)

- **Toggle:** Timeline (Gantt) / Day-by-day list / Map (Leaflet with stop pins + polyline route).
- **Print-friendly** mode (`@media print` styles).
- **Export PDF** button — uses `react-to-print` (no external service).

### 11.7 City Search (`/explore/cities`)

- Search bar → results grid with city cards (image, country flag, cost index 1–5 ₹ symbols, popularity stars).
- Filter: continent, max cost index, climate (post-MVP).
- **"Add to Trip"** dropdown lets user pick which trip to add to.

### 11.8 Activity Search (`/explore/activities` and inside builder)

- Filter chips: Sightseeing / Food / Adventure / Culture / Nightlife / Shopping / Nature.
- Cost filter (slider), duration filter.
- Card view with image, name, est. cost, duration, "Add to stop" button.

### 11.9 Trip Budget (`/trips/:id/budget`)

- **Top:** big number — total spend vs. budget limit (progress ring).
- **Charts (Recharts):** Donut by category, Bar by day, Line cumulative spend.
- **Table:** all `budget_entries`, editable inline.
- **Alerts:** chip "3 days over budget — see details" → scrolls to bar chart.
- **Currency switcher** (uses cached REST Countries rates — for hackathon, fixed conversion table).

### 11.10 Packing Checklist (`/trips/:id/packing`)

- Grouped by category, collapsible.
- Add via input with category dropdown, Enter to submit.
- Progress bar: "12 / 28 packed".
- "Reset all" + "Use template" (Beach / City / Trek pre-filled).

### 11.11 Public Itinerary View (`/p/:slug`)

- No login required, read-only.
- Big hero with cover, days timeline, map.
- Buttons: **"Copy Trip"** (requires login → clones), **"Share"** (Web Share API + copy-link fallback).
- View counter & clone counter visible.

### 11.12 Profile / Settings (`/settings`)

- Tabs: Profile / Preferences / Security / Saved destinations / Danger zone.
- **Danger zone:** delete account (soft + 30-day grace), confirms with typed email.

### 11.13 Notes (`/trips/:id/notes`)

- Markdown editor (uses `@uiw/react-md-editor`), notes scoped to trip or specific stop.
- Sorted by `updated_at desc`, search bar.

### 11.14 Admin (`/admin`)

- Cards: total users, total trips, MAU, avg trip duration.
- Tables: top 10 cities, top 10 activities (clickable to drill).
- User management: search, view, disable.

### 11.15 Global UI Elements

- **Top nav** with logo, search, notifications bell (post-MVP), avatar dropdown.
- **Toast system** (sonner) — success/error/warning.
- **Empty states** illustrated (use undraw.co — open license).
- **Skeleton loaders** on every async screen.
- **Error boundary** with friendly fallback + "Report bug" link.

---

## 12. DESIGN SYSTEM

### 12.1 Design Tokens (`packages/shared/tokens.ts`)

```ts
export const colors = {
  // Brand: ocean blue + sunset orange (travel feel)
  primary: { 50: "#eff6ff", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1" },
  accent: { 500: "#f97316", 600: "#ea580c" },
  neutral: {
    0: "#fff",
    50: "#f8fafc",
    100: "#f1f5f9",
    500: "#64748b",
    900: "#0f172a",
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  },
};
export const typography = {
  fontSans: '"Inter Variable", system-ui, sans-serif',
  fontDisplay: '"Cabinet Grotesk", "Inter Variable", sans-serif',
  scale: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
};
export const spacing = [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]; // px
export const radii = { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 };
export const shadows = {
  sm: "0 1px 2px rgba(15,23,42,.06)",
  md: "0 4px 12px rgba(15,23,42,.08)",
  lg: "0 12px 32px rgba(15,23,42,.12)",
};
```

### 12.2 Components (atomic)

- **Atoms:** Button, Input, Label, Badge, Avatar, Spinner, Icon, Tag.
- **Molecules:** FormField, SearchBar, Card, Modal, Toast, Tooltip, Tabs, DatePicker.
- **Organisms:** TripCard, StopCard, ActivityCard, BudgetChart, ItineraryTimeline, PackingList.
- **Templates:** AuthLayout, AppLayout (with sidebar), PublicLayout.

### 12.3 Responsive breakpoints

- `sm:640`, `md:768`, `lg:1024`, `xl:1280`, `2xl:1536`. Mobile-first; every screen tested at 360 px width.

### 12.4 Accessibility

- WCAG 2.2 AA: contrast ≥ 4.5:1, focus rings visible, all interactive elements keyboard-reachable, all images have `alt`, ARIA roles where needed.
- `prefers-reduced-motion` respected (disables Framer Motion).

### 12.5 Dark mode

- Toggle in nav, persisted in localStorage, respects `prefers-color-scheme`. Token system has parallel dark palette.

---

## 13. CORE ALGORITHMS

### 13.1 Budget Engine (deterministic, server-side)

```ts
// services/budget.service.ts
export function computeTripBudget(trip, stops, activities, entries) {
  const byCategory = {
    transport: 0,
    stay: 0,
    meals: 0,
    activity: 0,
    shopping: 0,
    misc: 0,
  };
  const byDay: Record<string, number> = {};
  let total = 0;

  for (const s of stops) {
    const days = daysBetween(s.arrival_date, s.departure_date) || 1;
    byCategory.transport += s.transport_cost;
    byCategory.stay += s.accommodation_cost;
    byCategory.meals += s.meal_cost_per_day * days;
    eachDate(s.arrival_date, s.departure_date, (d) => {
      byDay[d] =
        (byDay[d] ?? 0) + s.meal_cost_per_day + s.accommodation_cost / days;
    });
  }
  for (const sa of activities) {
    const cost = sa.custom_cost ?? sa.activity.estimated_cost ?? 0;
    byCategory.activity += cost;
    if (sa.scheduled_date)
      byDay[sa.scheduled_date] = (byDay[sa.scheduled_date] ?? 0) + cost;
  }
  for (const e of entries) byCategory[e.category] += e.amount;

  total = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const dailyAvg = total / Math.max(1, Object.keys(byDay).length);
  const overBudgetDays = Object.entries(byDay)
    .filter(([, v]) => v > dailyAvg * 1.5)
    .map(([d]) => d);

  return {
    total,
    byCategory,
    byDay,
    dailyAvg,
    overBudgetDays,
    pctOfLimit: trip.budget_limit ? total / trip.budget_limit : null,
  };
}
```

### 13.2 Smart Itinerary Generator (rule-based, no LLM)

Inputs: `cityIds[]`, `totalDays`, `interests[]`, `budgetCap`.  
Algorithm:

1. **Distribute days** across cities proportional to popularity score, min 1 day each.
2. For each city, **rank activities** by `score = 0.5*matchInterest + 0.3*(1 - normalizedCost) + 0.2*popularity`.
3. **Pack daily** ≤ 8 hours of activity time (greedy knapsack).
4. **Cost-check** — if exceeds budget, drop lowest-score activity and retry.
5. Return draft itinerary; user accepts/edits.

This is explainable, fast, and works offline. It satisfies "trendy AI with purpose" without external dependencies.

### 13.3 Search ranking (cities)

```sql
SELECT *, ts_rank(search_vector, plainto_tsquery($1)) +
          0.001 * popularity AS rank
FROM cities
WHERE search_vector @@ plainto_tsquery($1) OR name ILIKE $1 || '%'
ORDER BY rank DESC LIMIT 20;
```

### 13.4 OSM caching strategy

- On every Nominatim/Overpass call, persist result in our `cities`/`activities` tables.
- Subsequent identical queries hit Postgres only — making the app demo-resilient if internet drops.
- TTL: 30 days; background job to refresh.

---

## 14. SECURITY & INPUT VALIDATION

| Concern              | Mitigation                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Password storage** | bcrypt rounds=12. Never log raw passwords.                                                                               |
| **Auth tokens**      | Short-lived JWT (15 min) in `httpOnly`, `Secure`, `SameSite=Lax` cookie. Refresh-token rotation; revoke on logout/abuse. |
| **CSRF**             | SameSite=Lax + double-submit token for state-changing requests.                                                          |
| **XSS**              | React auto-escapes; markdown rendered via `rehype-sanitize`. CSP header.                                                 |
| **SQL injection**    | Drizzle parameterizes everything; no string concat in queries.                                                           |
| **IDOR**             | Every controller checks `trip.user_id === req.user.id` (or `is_public`).                                                 |
| **Rate limiting**    | `express-rate-limit` 100 req/15min per IP; stricter on `/auth` (5/min).                                                  |
| **Brute force**      | Login lockout after 10 fails / 15 min per email.                                                                         |
| **Helmet**           | Sets HSTS, X-Frame-Options, no-sniff, referrer policy.                                                                   |
| **CORS**             | Whitelist `localhost:5173` in dev, exact frontend origin in prod.                                                        |
| **File upload**      | Mime-type whitelist (jpg/png/webp), max 5 MB, ImageMagick re-encode to strip EXIF.                                       |
| **Secrets**          | `.env` (gitignored), `.env.example` checked in. Never hardcoded.                                                         |
| **Audit logs**       | All auth events + destructive actions written to `audit_logs`.                                                           |
| **DoS on OSM**       | Server-side rate-limit our outbound calls (1 req/sec to Nominatim per their TOS).                                        |

**Validation strategy.** Every POST/PATCH passes through a Zod-derived middleware:

```ts
export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success)
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: r.error.issues,
      },
    });
  req.body = r.data;
  next();
};
```

Frontend uses the same schema via `zodResolver` — so the user sees the _same_ error on the client before the request even fires.

---

## 15. PERFORMANCE, CACHING & SCALABILITY

- **DB indexes** on every FK + every common WHERE column (see DDL).
- **N+1 prevention** — Drizzle `relations()` with eager joins.
- **HTTP caching** — `Cache-Control: public, max-age=3600` on country/city read endpoints.
- **In-memory cache (LRU)** on the API for hot reads (top public itineraries).
- **Code splitting** — React lazy imports per route.
- **Image optimization** — WebP, `loading="lazy"`, responsive `srcset`.
- **Bundle budget** — main JS < 200 KB gzipped.
- **DB connection pool** — `pg-pool` size 10 in dev.
- **Pagination** everywhere lists exist (cursor-based for trip list).

---

## 16. TESTING STRATEGY

| Level             | Tool                           | Coverage target                                |
| ----------------- | ------------------------------ | ---------------------------------------------- |
| Unit (services)   | Vitest                         | ≥ 80% lines                                    |
| Integration (API) | Vitest + Supertest + test DB   | All endpoints, happy + error paths             |
| Component         | Vitest + React Testing Library | All organisms                                  |
| E2E               | Playwright                     | 3 critical flows: signup, create trip, publish |
| Type              | `tsc --noEmit` in CI           | 0 errors                                       |
| Lint              | ESLint + Prettier              | 0 warnings on PR                               |
| Security          | `npm audit --audit-level=high` | 0 high/critical                                |

**CI gates:** PR cannot merge unless lint, typecheck, unit, integration all green.

---

## 17. DEVOPS, GIT WORKFLOW & CI/CD

### 17.1 Git workflow (GitHub Flow, Conventional Commits)

- `main` is protected; only PR merges with 1 review.
- Branches: `feat/<scope>-<short>`, `fix/...`, `chore/...`, `docs/...`.
- Commits: `feat(builder): add drag-drop reordering`, `fix(auth): handle expired refresh token`.
- Every teammate must have ≥ 5 merged PRs (judges check).
- `CHANGELOG.md` auto-generated via `git-cliff`.

### 17.2 Repo structure (pnpm monorepo)

```
traveloop/
├── apps/
│   ├── web/                    # React + Vite
│   │   ├── src/
│   │   │   ├── components/     # atoms / molecules / organisms
│   │   │   ├── features/       # by-feature slices (trips, auth, builder...)
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── store/          # Zustand slices
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   └── api/                    # Express
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── db/             # drizzle schema + migrations
│       │   ├── middleware/
│       │   ├── utils/
│       │   ├── config/
│       │   └── server.ts
│       └── drizzle.config.ts
├── packages/
│   └── shared/                 # zod schemas, types, tokens
├── docker-compose.yml
├── .github/workflows/ci.yml
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
└── pnpm-workspace.yaml
```

### 17.3 CI (`.github/workflows/ci.yml`)

- Job 1: install + lint + typecheck.
- Job 2: unit + integration tests against ephemeral Postgres service container.
- Job 3: build web + api; upload artifacts.

### 17.4 Local dev

```bash
git clone … && cd traveloop
pnpm install
docker compose up -d postgres
pnpm db:migrate && pnpm db:seed
pnpm dev          # runs web (5173) + api (4000) concurrently
```

`README.md` will have this exact, copy-pasteable bootstrap — judges love this.

---

## 18. SPRINT PLAN (48-HOUR HACKATHON)

Assumes a 4-person team: **A (Backend lead), B (Frontend lead), C (DB + DevOps), D (Design + QA + AI feature)**.

### Hour 0–4 — Foundation

- C: Init monorepo, Docker, Postgres, Drizzle, migrations, seed.
- A: Express skeleton, auth endpoints, JWT.
- B: Vite + Tailwind + shadcn, AppLayout, routing.
- D: Tokens, design system, Figma mockups (or directly in code).

### Hour 4–14 — Core CRUD

- A: Trips, stops, activities, budget endpoints.
- B: Login, signup, dashboard, create-trip flow.
- C: Seed cities (top 200) + countries from REST Countries.
- D: TripCard, StopCard, AuthForm components.

### Hour 14–24 — Builder + Itinerary View

- B: Itinerary builder (drag-drop), itinerary view (timeline + map + list).
- A: Search endpoints (DB + Nominatim/Overpass cache).
- D: Activity search UI, packing checklist.

### Hour 24–34 — Budget + Public + Notes + Polish

- A: Budget aggregate, publish/clone, notes CRUD, admin.
- B: Budget screen with charts, public page, notes editor, profile.
- D: Smart Itinerary Generator UI + AI rule engine.
- C: Backups, README, env templates, deploy script.

### Hour 34–42 — Test + Polish + Pitch

- All: e2e tests, fix bugs, performance pass (Lighthouse).
- D: Demo dataset (5 beautiful pre-seeded public trips: Goa, Tokyo, Iceland, etc.).
- B/D: Animations, dark mode, micro-interactions.

### Hour 42–48 — Pitch Prep

- Slides, demo script, ER diagram printout, dry-run × 3.
- One teammate owns each major topic for Q&A.

---

## 19. DEMO SCRIPT (8 minutes)

1. **Hook (30s)** — "Last summer, I planned a Europe trip across 7 tabs. Today, in Traveloop, I'll do it in 4 minutes." (live timer on screen.)
2. **Sign up + Dashboard (45s)** — show responsive UI, dark mode toggle.
3. **Create trip (45s)** — multi-step form, image upload.
4. **Builder magic (2 min)** — search Paris (live OSM hit), add 3 cities, drag to reorder, add 6 activities, conflict detection.
5. **Itinerary view (45s)** — toggle Timeline / Map / List.
6. **Budget intelligence (1 min)** — pie chart, over-budget day flagged, switch currency.
7. **Smart Generator (45s)** — click "Generate", watch a 3-day Tokyo itinerary auto-build.
8. **Publish + Clone (45s)** — generate slug, open incognito, clone trip to second account.
9. **Architecture flash (60s)** — show ER diagram, repo, CI green checks, Lighthouse 98/100/100/100, test coverage report.
10. **Close (15s)** — "No paid APIs. No vendor lock-in. 15 normalized tables. Every line ours. Thank you."

**Q&A prep (one slide each):** DB choices, security, scalability, why no Firebase, how AI works, how we cache OSM, what we'd do with 1 more week.

---

## 20. RISK REGISTER

| Risk                     | Likelihood | Impact       | Mitigation                                                              |
| ------------------------ | ---------- | ------------ | ----------------------------------------------------------------------- |
| Internet down at venue   | Med        | High         | All OSM data cached in Postgres + offline service worker                |
| Nominatim rate-limited   | Med        | Med          | Server-side throttle + cache + seed 200 cities up front                 |
| Drag-drop bugs on mobile | Med        | Low          | dnd-kit has touch sensors; test on phone hour 30                        |
| Team member sick         | Low        | High         | Pair-programming + everyone reads everyone's PRs                        |
| Scope creep              | High       | High         | This PRD is the contract; anything not P0 is a stretch goal             |
| DB migration error live  | Low        | High         | Migrations tested in CI; backup before demo                             |
| Demo crash               | Low        | Catastrophic | Pre-recorded backup video; localhost-only demo (no internet dependency) |

---

## 21. FUTURE ROADMAP (Post-Hackathon)

- Real-time collaborative editing (CRDT via Yjs).
- Booking integrations (Skyscanner, Booking.com affiliate).
- Mobile apps (React Native, share business logic).
- LLM-powered natural language planning ("plan me a 10-day Italy trip under ₹80k").
- Social graph: follow travelers, like trips.
- Carbon footprint estimator per trip.
- Multi-currency with live FX (cached daily).

---

## 22. APPENDIX

### A. Validation rules summary

| Field         | Rule                                          |
| ------------- | --------------------------------------------- |
| email         | RFC-5322, ≤ 254 chars, lowercase normalized   |
| password      | 8–72 chars, ≥1 uppercase, ≥1 digit, ≥1 symbol |
| trip name     | 3–150 chars, no leading/trailing whitespace   |
| dates         | ISO-8601, end ≥ start, ≤ 365 days span        |
| budget        | numeric ≥ 0, ≤ 1e9, max 2 decimals            |
| city query    | 1–80 chars, sanitized for SQL/LIKE            |
| markdown body | ≤ 20 KB, sanitized via rehype-sanitize        |
| image         | jpg/png/webp, ≤ 5 MB, max 2400×2400 px        |

### B. Error codes

`VALIDATION_ERROR (400)`, `UNAUTHORIZED (401)`, `FORBIDDEN (403)`, `NOT_FOUND (404)`, `CONFLICT (409)`, `RATE_LIMITED (429)`, `INTERNAL_ERROR (500)`, `EXTERNAL_SERVICE_DOWN (502)`.

### C. Glossary

- **Trip** — top-level travel plan owned by one user.
- **Stop** — visit to one city within a trip (with arrival/departure dates).
- **Activity** — a thing to do, attached to a city; can be assigned to a stop.
- **Public Itinerary** — read-only shareable version of a trip via slug URL.
- **Clone** — creating a copy of someone's public trip in your own account.

### D. Pre-seeded demo data

- 200 popular cities worldwide (geo-coordinates, cost index, image).
- 1,500 activities across top 50 cities.
- 5 curated public itineraries to populate the homepage.

---

## 🏆 CHECKLIST: ODOO REQUIREMENTS COVERAGE

| Odoo Criterion                          | Where addressed                                              |
| --------------------------------------- | ------------------------------------------------------------ |
| Real-time/dynamic data, not static JSON | §7.4, §13.4 (live OSM + Postgres cache)                      |
| Responsive, clean UI, consistent colors | §11, §12 (full design system)                                |
| Robust input validation                 | §10.9, §14, §22A (Zod end-to-end)                            |
| Intuitive navigation, spacing           | §11.15 (global UI), §12 (tokens)                             |
| Proper Git use by all members           | §17.1 (Conventional Commits, ≥5 PRs/member)                  |
| Backend APIs, data modeling, local DB   | §9 (15-table schema), §10 (REST API), Postgres only          |
| Understand AI/code thoroughly           | §13.2 (rule-based, explainable; no blind copy-paste)         |
| Offline / non-cloud capability          | §7.1 PWA, §13.4 OSM cache, Docker-local stack                |
| Trendy tech with purpose                | §13.2 AI Generator (purposeful), PostGIS, PWA                |
| Coding standards, modularity            | §8 (layered architecture), §17.2 (folder structure)          |
| Performance, scalability                | §15 (caching, indexes, pagination, bundle budget)            |
| Security, usability                     | §14 (full security playbook)                                 |
| Debugging skills                        | Pino structured logs, error boundary, audit_logs             |
| Database design                         | §9 (DDL, indexes, PostGIS, full-text, soft deletes, audit)   |
| Attention to detail                     | Skeleton loaders, dark mode, a11y, print styles, undo toasts |

---

**END OF PRD — Version 1.0**

> _"Build it like a startup, ship it like a hackathon, present it like founders."_
