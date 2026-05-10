# Contributing to Traveloop

Thank you for being part of the team! This guide covers everything you need to contribute effectively.

---

## Quick Start

```bash
git clone git@github.com:Davdekismortels/odoo-hackathon.git
cd odoo-hackathon
npm install
npm run db:migrate
npm run db:seed
npm run dev          # Starts API (4000) + Web (5173) concurrently
```

---

## Git Workflow

We follow **GitHub Flow** with **Conventional Commits**.

### Branch naming
```
feat/<scope>-<short-description>   # New feature
fix/<scope>-<short-description>    # Bug fix
chore/<scope>-<short-description>  # Tooling / deps
docs/<scope>-<short-description>   # Documentation only
```

### Commit message format
```
<type>(<scope>): <short description>

feat(builder): add drag-drop reordering for stops
fix(auth): handle expired refresh token gracefully
chore(deps): upgrade drizzle-orm to 0.36
docs(api): document budget endpoint response shape
```

### Rules
- `main` is **protected** — never push directly
- Every feature/fix goes through a **Pull Request**
- At least **1 approval** required before merge
- PR title must follow Conventional Commits format
- Each team member targets **≥ 5 merged PRs** (judges check this)

---

## Code Style

- **TypeScript strict mode** — no `any`, no `@ts-ignore`
- **ESLint + Prettier** — run `npm run lint` before pushing
- All API endpoints need **Zod validation** (use schemas from `packages/shared`)
- All controllers must use the `ApiResponse<T>` return shape
- Services throw errors with a `.code` property; controllers translate them to HTTP status codes

---

## Project Structure

```
apps/api/src/
├── config/         # Environment config
├── controllers/    # HTTP request handlers (thin layer)
├── db/             # Drizzle schema, migrations, seed
├── middleware/     # Auth, validation, rate limiting, error handling
├── repositories/   # Database queries (all DB access goes here)
├── routes/         # Express routers
├── services/       # Business logic
└── utils/          # Shared helpers (jwt, password, crypto)

apps/web/src/
├── components/     # Atoms → Molecules → Organisms
├── features/       # By-feature slices (auth, trips, builder...)
├── hooks/          # Custom React hooks
├── lib/            # API client, query client
├── pages/          # Route-level page components
├── store/          # Zustand state slices
└── styles/         # Global CSS

packages/shared/src/
├── schemas.ts      # Zod validation schemas (shared client/server)
├── types.ts        # TypeScript types for all entities
└── tokens.ts       # Design system tokens
```

---

## Adding a New API Endpoint

1. **Schema** — add Zod schema to `packages/shared/src/schemas.ts`
2. **Repository** — add DB query function to `repositories/<entity>.repository.ts`
3. **Service** — add business logic to `services/<entity>.service.ts`
4. **Controller** — add HTTP handler to `controllers/<entity>.controller.ts`
5. **Route** — register in `routes/<entity>.routes.ts` and mount in `server.ts`
6. **Type** — add TypeScript type to `packages/shared/src/types.ts`

---

## Database Changes

- Never edit `migrate.ts` directly for new changes — append a new migration block
- Run `npm run db:migrate` after any schema change
- Run `npm run db:seed` to refresh seed data
- SQLite is used in development; Postgres in production (one env var change)

---

## Environment Variables

Copy `.env.example` to `.env` — never commit `.env`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./traveloop.db`) |
| `JWT_SECRET` | Must be ≥ 32 random chars in production |
| `JWT_EXPIRY` | Access token TTL (default: `15m`) |
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL (default: `7d`) |
| `CORS_ORIGIN` | Frontend URL (default: `http://localhost:5173`) |

---

## PR Checklist

Before opening a PR, confirm:

- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 warnings)
- [ ] `npm run db:migrate` runs cleanly if schema changed
- [ ] New endpoints have Zod validation
- [ ] New endpoints are tested manually (curl or Postman)
- [ ] PR title follows Conventional Commits format
- [ ] PR description explains **what** and **why**, not just **what**
