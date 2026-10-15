# HyperResume — AI Job-Application Optimization Platform

HyperResume is an AI job-application optimization platform with a resume builder at its core. It helps candidates turn their real experience into a stronger, truthful, job-specific application.

---

## Workspace Structure

- `frontend/`: Next.js 16 (App Router, React 19, TailwindCSS v4, TypeScript).
- `backend/`: NestJS 12 (TypeScript strict, TypeORM, PostgreSQL, ESM).
- `docs/`: Product context, strategy, implementation plan, and setup guides.

---

## Quick Start

### 1. Requirements
- **Bun:** `v1.3.2+`
- **Node.js:** `v20.0.0+`
- **PostgreSQL:** Running on `localhost:5432` with database `hyper_resume_db`

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env
# Set DATABASE_PASSWORD in backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Run Migrations
```bash
bun run db:migrate
```

### 4. Start Development Servers
```bash
bun run dev:backend   # API on http://localhost:3001/api/v1 (Docs: /api/docs)
bun run dev:frontend  # App on http://localhost:3000
```

### 5. Run Quality Checks & Tests
```bash
bun run lint          # Linting across backend and frontend
bun run typecheck     # Strict TypeScript type checks
bun run test          # Unit and E2E test suites
bun run build         # Production builds
```

For complete instructions, see [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) and [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).
