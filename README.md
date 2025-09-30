Rental (Gear Up)
Modern peer‑to‑peer gear rental platform. The application streamlines listing, discovering, and booking equipment (cameras, lenses, outdoor gear, etc.) with a secure authentication flow and a clean, component‑driven UI.

Problem Statement
Access to high‑quality gear is expensive and often underutilized. Owners need a safe way to lend idle equipment; renters need a fast way to find available gear nearby with transparent pricing and scheduling.

Goals
- Provide an intuitive onboarding and authentication experience (email/password and Google sign‑in)
- Make discovery, listing, and booking of gear fast and reliable
- Establish strong foundations for payments, messaging, reviews, and availability management
- Evolve toward a separated frontend and backend to harden security and enable independent scaling

Key Features
Implemented
- Authentication: Credentials and Google OAuth via NextAuth, secure password hashing (bcryptjs)
- Signup UX: Real‑time password guidance and strength checks
- Login UX: Email format validation, password visibility toggle, clear error states
- Onboarding: Birthday and phone capture to complete profile
- Gear UI Building Blocks: Gear cards, search input, booking calendar component
- Type‑safe APIs: tRPC with Zod validation and React Query integration

Planned / In Progress
- Payments and Payouts (provider evaluation, escrow flows)
- Messaging between renters and owners
- Booking lifecycle (requests, confirmations, cancellations)
- Reviews and trust signals
- Service separation: backend API service decoupled from Next.js app

Technical Stack
Frontend
- Next.js 15 (App Router) with React 19
- TypeScript
- Tailwind CSS and shadcn‑ui primitives
- Lucide icons, date‑fns utilities

Data & API
- tRPC v11 with React Query and superjson
- Zod for request/response validation

Auth & Persistence
- NextAuth (Credentials + Google) with Prisma Adapter
- Prisma ORM targeting a SQL database (e.g., PostgreSQL)
- bcryptjs for password hashing

Tooling
- ESLint, Prettier, TypeScript strict mode
- Cypress E2E test scaffolding

Architecture Overview
- Monolithic Next.js application today: UI, API routes, tRPC server, and Prisma reside in one repo
- Domain‑oriented component structure: `features/*` for feature code, `ui/*` for generic primitives
- Server code lives under `src/server/routers/*` with `src/server/trpc.ts` wiring
- Data access via `src/lib/db.ts` Prisma client

Separation Plan (Critical Security and Ops Work)
- Objective: run the backend as an independent service, expose a stable HTTP API, and connect the frontend over this API
- Benefits: stricter network boundaries, secret isolation, independent deploy and scale, better observability
- Direction:
  - Extract tRPC procedures into a dedicated service (or convert to REST/HTTP tRPC) with explicit auth checks
  - Frontend consumes the API via typed client; no direct DB access from Next.js
  - Consolidate auth/session on the backend; issue secure, HTTP‑only cookies or JWTs across services

Repository Structure (selected)
```
rental/
  prisma/                 Prisma schema and migrations
  src/
    app/                 Next.js App Router pages and routes
      api/               Next.js API routes (Auth, tRPC)
    components/
      features/auth/     Auth‑specific components (inputs, validation, UI)
      ui/                Design‑system primitives (Button, Input, Dialog, etc.)
    lib/                 Client utilities (db, trpc client, hooks, validators)
    server/              tRPC routers and server wiring
    types/               Shared TypeScript types
  cypress/               E2E tests
```

Environment
Create a `.env` file with values for local development. Example keys:
```
DATABASE_URL=postgresql://user:password@localhost:5432/rental
AUTH_SECRET=replace_with_a_strong_random_value
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```

Development
Install dependencies and generate Prisma client:
```
pnpm install
pnpm prisma:generate
```

Database migrations (dev):
```
pnpm prisma:migrate-dev
pnpm prisma:studio
```

Run the app:
```
pnpm dev
```

Project Scripts
```
dev                   Start Next.js in development
build                 Build for production
start                 Start production server
lint                  Run ESLint
postinstall           Prisma generate
prisma:migrate-dev    Run dev migrations
prisma:migrate-deploy Deploy migrations
prisma:studio         Prisma Studio
prisma:generate       Generate Prisma client
db:seed               Seed database (if configured)
```

API Surface (current)
- NextAuth credentials authorize with bcrypt comparison
- tRPC routers under `src/server/routers`: `auth`, `user`, `gear` (extensible)
- App Router API endpoints in `src/app/api/*`

Developer Onboarding
- Branching: feature branches off `main`, prefer squash merges for a concise history
- Commit style: small, focused commits with clear messages
- Comments and Headers: consistent `@file` and `@description` headers; neutral, professional tone using “we/our app” language
- UI Conventions: shared primitives in `components/ui`, feature‑specific UI under `components/features/*`

Open Issues / Near‑Term Work
- Align backend credential errors with frontend messages for clearer UX
- Clean unused imports and solidify auth page copy to match style guide
- Review and convert inline TODOs in middleware and routers into tracked tasks
- Extract backend into a separate service with an HTTP API; remove direct DB access from the Next.js app
- Define API contracts (auth, user, gear, booking) and add integration tests

Roadmap Highlights
- Payments, disputes, refunds
- Messaging and notifications
- Booking lifecycle and availability calendar integration
- Reviews and ratings
- Admin controls and auditing

Security Notes
- Passwords hashed with bcrypt
- Session management via NextAuth (JWT strategy) with custom claims
- Move secrets and database connectivity exclusively to the backend service during separation

License
MIT License. See `LICENSE`.
