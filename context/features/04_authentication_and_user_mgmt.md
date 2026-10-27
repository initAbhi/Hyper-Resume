# Authentication, User Management & Credit System — Feature Specification

**Routes**: 
* Login: `/login` (`frontend/app/(auth)/login/page.tsx`)
* Register: `/register` (`frontend/app/(auth)/register/page.tsx`)
* Account & Billing Settings: `/app/settings` (`frontend/app/app/settings/page.tsx`)
**Client Auth Context**: `frontend/lib/auth-context.tsx`  
**Backend Auth Module**: `backend/src/auth/*`  
**Backend Credits Module**: `backend/src/credits/*`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/login`)  

---

## 1. Authentication Architecture

HyperResume utilizes stateless JSON Web Token (JWT) authentication backed by PostgreSQL user sessions and bcrypt password hashing.

```
┌──────────────┐           POST /api/v1/auth/login            ┌──────────────┐
│    Client    │ ───────────────────────────────────────────> │  AuthModule  │
│  (Next.js)   │                                              │   (NestJS)   │
│              │ <─────────────────────────────────────────── │              │
│              │   200 OK + { access_token, user, credits }   └──────┬───────┘
└──────┬───────┘                                                     │
       │                                                             ▼
       │ Stores token in localStorage                        ┌──────────────┐
       │ Injects "Authorization: Bearer <token>"              │  PostgreSQL  │
       ▼                                                     │  users table │
┌──────────────┐          GET /api/v1/auth/me                 └──────────────┘
│ Protected UI │ ───────────────────────────────────────────> Validates JWT
│ (/app/*)     │ <─────────────────────────────────────────── Returns profile
└──────────────┘
```

---

## 2. 1-Click Demo Account Auto-Fill

To provide seamless testing without requiring visitors to create throwaway accounts, the `/login` screen includes an automated demo auto-fill utility:

* **Button Label**: `Auto-fill Demo Account`
* **Credentials Pre-loaded**:
  * Email: `demo@hyperresume.ai`
  * Password: `demo123`
  * Starting Balance: `33 Credits`
* **Implementation Details**:
  * Populates form state instantly.
  * Dispatches synthetic change events to ensure browser autocomplete triggers.
  * Optionally triggers instant auto-submit so evaluators reach the dashboard in 1 click.

---

## 3. JWT Token Handling & Client Interceptor

* **Token Storage**: Saved under `localStorage.getItem('hyperresume_token')`.
* **API Client Integration (`frontend/lib/api-client.ts`)**:
  ```typescript
  const token = typeof window !== 'undefined' ? localStorage.getItem('hyperresume_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
  ```
* **Session Expiration**: Tokens expire after 7 days. If a `401 Unauthorized` is returned by any API call, the client clears `localStorage` and redirects the user to `/login?session_expired=true`.

---

## 4. Protected Route & Navigation Guard

The authenticated workspace routes under `/app/*` are protected via `AuthProvider` (`frontend/lib/auth-context.tsx`):
* While verifying token: Renders smooth skeleton loader.
* If unauthenticated: Redirects to `/login?redirect=${encodeURIComponent(currentPath)}`.
* If authenticated: Loads candidate profile, current resumes, and live credit balance.

---

## 5. Credit Ledger & Usage Economy

To prevent API abuse and track AI consumption, HyperResume employs a double-entry credit ledger (`backend/src/credits/entities/credit-ledger.entity.ts`).

### 5.1 Pricing / Deduction Schedule

| Action | Cost (Credits) | Description |
| :--- | :---: | :--- |
| **New Account Creation** | `+25` (Grant) | Free trial bonus granted upon registration |
| **STAR Bullet Optimization** | `-1` | Deep LLM prompt restructuring single bullet point |
| **Job Description Match Analysis** | `-2` | Requirement competency extraction & gap scoring |
| **Full Resume AI Review** | `-5` | Multi-category comprehensive 100-point audit |
| **PDF Export (Standard ATS)** | `0` (Free) | Standard PDF generation is unlimited and free |

### 5.2 Real-Time Balance Display
* Header badge in `/app/*` displays current credit count with a subtle lightning icon: `⚡ 33 Credits`.
* When balance drops below 5, an upgrade warning appears linking to `/pricing`.
