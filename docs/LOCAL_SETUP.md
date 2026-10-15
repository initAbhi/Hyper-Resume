# HyperResume — Local Setup & Development Guide

This guide details the step-by-step instructions to configure, run, test, and maintain HyperResume locally.

---

## 1. Prerequisites & Tooling

- **Package Manager:** [Bun](https://bun.sh) `v1.3.2+`
- **Node.js Runtime:** `v20.0.0+` or `v22.22+` (Node 22 installed locally)
- **Database:** PostgreSQL `14+` running on `localhost:5432`

---

## 2. Environment Configuration

### Backend
1. Copy the example configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Verify or update the following variables in `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000

   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=hyper_resume_db
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_actual_postgres_password
   ```

### Frontend
1. Copy the example configuration:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
2. Ensure the API endpoint points to the backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## 3. Database Initialization & Migrations

The database `hyper_resume_db` must be created on your local PostgreSQL instance:
```bash
# If not already created:
createdb -h localhost -U postgres hyper_resume_db
```

### TypeORM Migration Commands
HyperResume strictly enforces `synchronize: false`. All schema updates occur through migrations:

- **Check migration status:**
  ```bash
  bun run db:status
  ```
- **Apply pending migrations:**
  ```bash
  bun run db:migrate
  ```
- **Revert the last migration:**
  ```bash
  bun run db:revert
  ```
- **Generate a new migration from entity changes:**
  ```bash
  bun run db:generate -- src/database/migrations/YourMigrationName
  ```

---

## 4. Starting the Application

From the root workspace directory:

### Run Backend Development Server (Port 3001)
```bash
bun run dev:backend
```
- API Base URL: `http://localhost:3001/api/v1`
- OpenAPI/Swagger Documentation: `http://localhost:3001/api/docs`
- Health Checks:
  - Liveness: `http://localhost:3001/api/v1/health/live`
  - Readiness: `http://localhost:3001/api/v1/health/ready`

### Run Frontend Development Server (Port 3000)
In a separate terminal:
```bash
bun run dev:frontend
```
- Frontend Web App: `http://localhost:3000`

---

## 5. Testing & Quality Verification

Run the automated test suites, type checking, and linting from the workspace root:

```bash
# 1. Run all linter checks (Oxlint for backend, ESLint for frontend)
bun run lint

# 2. Run TypeScript strict type checks across backend and frontend
bun run typecheck

# 3. Run all test suites (Backend Vitest, Frontend Bun test, Backend E2E)
bun run test

# 4. Run production builds
bun run build
```

Individual test suites can be run separately:
```bash
bun run test:backend   # Backend unit tests
bun run test:frontend  # Frontend component/client tests
bun run test:e2e       # Backend database and API integration tests
```

---

## 6. Security & Invariant Rules

1. **Never commit `.env` or `.env.local` files.** Always keep placeholders in `.env.example`.
2. **Never set `synchronize: true`** in TypeORM options.
3. **Database credentials and secrets are strictly redacted** from all application logs and error responses.
4. **All endpoints enforce correlation IDs (`X-Request-ID`)** for end-to-end request tracing.
