# Hyper-Resume Autonomous Engineering Environment: AGENTS.md

Welcome to the **Hyper-Resume** autonomous software engineering environment. All AI agents, subagents, and human-in-the-loop collaborators operating within this repository must strictly adhere to the guidelines, execution boundaries, and safety invariants defined in this document.

---

## 1. Engineering Standards

### 1.1 Architecture & Modularity
- **Monorepo Layout**:
  - `frontend/`: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4.
  - `backend/`: NestJS 12 modular monolith, TypeORM, PostgreSQL 16, strict ESM (`"type": "module"`).
  - `docs/` & `context/`: Historical documentation and PRDs.
  - `.ai/`: Operational state, task tracking, audits, ADRs, and context intelligence.
  - `.agents/`: Antigravity workspace customizations (agents, skills, rules).
- **TypeScript Strictness**:
  - Zero `any` types allowed in production paths. Always define explicit interfaces and DTOs.
  - Runtime validation on all external inputs: use `class-validator` and `class-transformer` on NestJS backend DTOs, and explicit schema validation on frontend API endpoints.
- **Frontend Paradigms**:
  - Server Components by default; designate Client Components with `'use client'` only when state, effects, or browser APIs are required.
  - Follow the responsive layout rules in `.agents/rules/responsive-ui.md`: mobile-first (320px+), no horizontal clipping (`min-w-0`), proper touch targets (>= 40px).
- **Backend Paradigms**:
  - NestJS modular structure: Controller -> Service -> Repository / External Adapter.
  - Never execute raw unstructured SQL queries. Use TypeORM repository abstractions or explicit parameterized queries.
  - Ensure all service methods are unit-testable with clear mocking seams.

---

## 2. Autonomous Execution Boundaries

Hyper-Resume operates under **Guarded Autonomy**. Agents are empowered to inspect, diagnose, document, test, and propose safe code enhancements, but must strictly halt and request human approval before executing irreversible or business-critical actions.

### 2.1 Permitted Autonomous Actions (No Human Approval Needed)
- **Repository Analysis**: Deep codebase exploration, AST parsing, dependency checks, architectural auditing.
- **Documentation**: Creating and updating markdown files inside `.ai/`, `docs/`, or code docstrings.
- **Non-destructive Code Analysis**: Static analysis, linting, dead code identification, security vulnerability scans.
- **Safe Testing**: Running local test suites (`bun run test`, `vitest run`, `bun test`, `bun run lint`, `bun run typecheck`).
- **Low-risk Reversible Improvements**:
  - Fixing typos, non-functional comment enhancements.
  - Adding new test cases that do not alter application logic.
  - Adding new isolated helper functions with 100% test coverage.
  - Creating new skills or agent instructions in `.agents/`.

### 2.2 Strictly Gated Actions (Mandatory Human Approval Required)
The agent must **NEVER** execute any of the following without explicit, written confirmation from the user in chat:
1. **Destructive Database Changes**: Running `migration:revert`, table drops, column drops, truncate commands, or altering existing column types.
2. **Payment & Billing Logic**: Any modification to Dodo Payments webhook verifications, pricing tiers, checkout sessions, or customer entitlement services.
3. **Authentication & Authorization**: Changes to JWT signing secrets, token expiration logic, password hashing algorithms (bcrypt), cookie security attributes (`httpOnly`, `sameSite`, `secure`), or Google OAuth callback handling.
4. **Production Deployments & Releases**: Triggering deployment workflows, pushing to `main` or release tags, executing remote SSH/cloud infrastructure commands.
5. **Data Deletion**: Truncating records, deleting user accounts, removing resume drafts, or purging historical audit logs.
6. **External Financial Transactions**: Any action that can trigger payments, transfers, external API consumption billing spikes, or subscription provisioning.

---

## 3. Security Requirements

### 3.1 Secrets and Environment Variables
- Never hardcode secrets, API keys, JWT secrets, database credentials, or SMTP credentials in code or commits.
- All secrets must be loaded via NestJS `ConfigService` or Next.js `process.env`.
- Inspect `.env.example` when adding new configurable parameters; never commit `.env` or `.env.local` files.
- Redact secrets when printing logs or recording audit outputs in `.ai/`.

### 3.2 Input Sanitization & File Uploads
- Hyper-Resume accepts user-uploaded files (PDF, DOCX) for resume parsing.
- File uploads must be strictly validated: mime-type sniffing, magic number inspection, file size bounds, and isolated memory parsing.
- External HTML rendering (e.g., in rich-text resume editors) must be sanitized to eliminate Cross-Site Scripting (XSS).

### 3.3 Access Control & Multi-Tenancy
- Every resume, cover letter, and interview record belongs to a specific `userId`.
- Every database query updating or reading user assets must enforce ownership checks (`WHERE id = :id AND userId = :userId`).

---

## 4. Testing Requirements

### 4.1 Verification Discipline
No feature or bugfix is considered complete without automated verification.
- **Backend Quality Gate**:
  - `bun run --cwd backend typecheck`
  - `bun run --cwd backend lint`
  - `bun run --cwd backend test`
- **Frontend Quality Gate**:
  - `bun run --cwd frontend typecheck`
  - `bun run --cwd frontend lint`
- **End-to-End & Browser Verification**:
  - Critical flows (Resume Builder, ATS Scan, Checkout redirect) must be verified with browser-based checks or E2E scripts before release sign-off.

### 4.2 Non-Breaking Guarantee
Existing tests must pass before and after any code modification. If an existing test fails, analyze whether the failure is legitimate before considering any test assertion updates.

---

## 5. Documentation Maintenance

### 5.1 Keep the Brain Updated
Whenever an agent executes an audit, completes a task, or changes architectural direction:
- Log the audit report in `.ai/audits/YYYY-MM-DD_<name>-audit.md`.
- Update task status in `.ai/tasks/` (`active/` -> `completed/`).
- If an architectural trade-off is made, draft an ADR in `.ai/decisions/`.
- Keep `.ai/state/SYSTEM_STATE.md` aligned with current repository health.

---

## 6. Git Safety

### 6.1 Preserving Existing Work
- **NEVER** overwrite or discard unstaged user work (e.g., `git restore .`, `git checkout -- .`, `git reset --hard` are strictly forbidden unless explicitly commanded by the user).
- Check `git status` before and after modifying files.

### 6.2 Branching and Commits
- All agent-driven development must occur on descriptive feature branches (`feature/<slug>` or `fix/<slug>`).
- Commits must be atomic, concise, and follow Conventional Commits:
  - `feat(...)`, `fix(...)`, `test(...)`, `docs(...)`, `refactor(...)`.
- Never force push (`git push -f`) to remote repositories.

---

## 7. Human Approval Protocol

When encountering a gated action (Section 2.2):
1. **Halt Execution**: Stop the automated workflow immediately.
2. **Explain the Proposed Change**: Provide a clear diff or summary of what is about to happen.
3. **Detail Risks & Rollback Plan**: Outline potential failure modes and how to revert if issues arise.
4. **Explicitly Prompt the User**: Ask: *"This action requires explicit approval under the Guarded Autonomy policy. Do you approve proceeding with [action]?"*
5. **Wait for Confirmation**: Do not assume approval until the user gives explicit consent in their next message.

