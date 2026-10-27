# Environment Variables, CORS Policies & Proxy Configuration

**Classification**: DevOps & Network Configuration  
**API Prefix**: `/api/v1`  
**Frontend Origin**: `https://resume.fourth-coffee.shop`  
**Backend API Origin**: `https://resume-api.fourth-coffee.shop`  
**Status**: 🟢 Production Configured & Verified  

---

## 1. Environment Variable Specifications

### 1.1 Frontend Environment (`frontend/.env.production`)

```ini
# Production API Endpoint (Nginx reverse proxied to NestJS :3002)
NEXT_PUBLIC_API_URL=https://resume-api.fourth-coffee.shop/api/v1

# Site Canonical URL
NEXT_PUBLIC_SITE_URL=https://resume.fourth-coffee.shop

# Node Environment
NODE_ENV=production
PORT=3082
```

### 1.2 Backend Environment (`backend/.env`)

```ini
# Application Configuration
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://resume.fourth-coffee.shop
ENABLE_SWAGGER=true

# Database Configuration (PostgreSQL 16)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[REDACTED_POSTGRES_CREDENTIAL]
DB_NAME=hyper_resume
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Authentication & Security
JWT_SECRET=[REDACTED_ENTERPRISE_JWT_SECRET]
JWT_EXPIRATION=7d
COOKIE_SECRET=[REDACTED_COOKIE_SECRET]

# AI Provider Configuration
OPENAI_API_KEY=[REDACTED_API_KEY]
AI_MODEL_FAST=gpt-4o-mini
AI_MODEL_HIGH_QUALITY=gpt-4o
```

---

## 2. CORS (Cross-Origin Resource Sharing) Architecture

Cross-origin requests from the Next.js frontend (`resume.fourth-coffee.shop`) to the backend API (`resume-api.fourth-coffee.shop`) are secured and governed by NestJS in `backend/src/main.ts`.

### 2.1 Dynamic Origin Whitelist
The CORS middleware allows:
* The primary production domain: `https://resume.fourth-coffee.shop`
* Any subdomain on the root domain: `^https?:\/\/([a-z0-9-]+\.)*fourth-coffee\.shop(:\d+)?$`
* Local development origins: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://localhost:3082`

### 2.2 Credentials & Header Exchange
* **`credentials: true`**: Allows authorization bearer headers and secure cookies to be transmitted across origins.
* **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`.
* **Allowed Headers**:
  * `Content-Type`
  * `Authorization`
  * `X-Request-ID`
  * `Accept`
  * `Origin`
  * `X-Requested-With`
* **Exposed Headers**:
  * `Content-Disposition` (essential for streaming PDF binary downloads with custom filenames).

---

## 3. Proxy Header Ingestion & Rate Limiting

Because the backend operates behind an Nginx reverse proxy on `localhost:3002`:

1. **Client IP Resolution**:
   Nginx forwards the real client IP via `X-Real-IP` and `X-Forwarded-For`. Express is configured with `app.set('trust proxy', 1)` to prevent rate limiters from treating all incoming requests as originating from `127.0.0.1`.
2. **Payload Size Limits**:
   Both Nginx (`client_max_body_size 10M;`) and Express (`express.json({ limit: '10mb' })`) allow up to 10MB payloads to support rich resume attachments and multi-page imports.
3. **HTTP/2 Preflight Handling**:
   Nginx passes preflight `OPTIONS` requests through to NestJS, which immediately returns `204 No Content` with appropriate `Access-Control-Allow-*` headers.
