# Production Server Access & Full Deployment Guide — HyperResume

**Target Server**: `210.79.128.247`  
**SSH User**: `ubuntu`  
**SSH Key**: `id_ed25519` (Stored in this folder: `c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519`)  
**Web Domains**:
* Web Frontend: [https://resume.fourth-coffee.shop](https://resume.fourth-coffee.shop)
* Backend REST API: [https://resume-api.fourth-coffee.shop](https://resume-api.fourth-coffee.shop)
* Sample Library: [https://resume.fourth-coffee.shop/examples](https://resume.fourth-coffee.shop/examples)

---

## 🔑 1. Quick SSH Connection Commands

### From PowerShell (Windows)
Using the key directly from this directory:
```powershell
ssh -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" ubuntu@210.79.128.247
```
Or using the user's home SSH directory:
```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@210.79.128.247
```

### From Git Bash / WSL / Linux / macOS
```bash
# Ensure strict permissions on the private key
chmod 600 id_ed25519

# Connect to the server
ssh -i ./id_ed25519 ubuntu@210.79.128.247
```

---

## 🖥️ 2. Server Architecture & Directory Layout

* **Project Root**: `/var/www/hyper-resume`
* **Frontend Root**: `/var/www/hyper-resume/frontend`
* **Backend Root**: `/var/www/hyper-resume/backend`
* **Ecosystem File**: `/var/www/hyper-resume/ecosystem.config.cjs`

### Active PM2 Processes (Running under `root`)
> [!IMPORTANT]
> The PM2 daemon on this server runs under the `root` user. Running `pm2 list` as the default `ubuntu` user will show an empty list. Always prefix PM2 commands with `sudo`:

| ID | Name | Script Path | Mode | Port | Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **14** | `hyper-resume-frontend` | `node server.js` | fork | `3082` | **online** |
| **13** | `hyper-resume-backend` | `dist/main.js` | fork | `3002` | **online** |

---

## 🚀 3. Step-by-Step Frontend Deployment

When deploying changes to the Next.js frontend:

### Step 3.1: Build Locally
```powershell
cd c:\Users\AbhiSingh\Pictures\builder\frontend
bun run build
```
*(Ensure `.next/standalone` is generated)*

### Step 3.2: Package the Distribution
```powershell
# Create deployment archive including standalone, static, and public assets
tar -czf frontend-dist.tar.gz -C .next/standalone . -C ../.next static -C ../public .
```
Or archive the entire `.next` and `public` folders:
```powershell
tar -czf frontend-dist.tar.gz .next public package.json
```

### Step 3.3: Upload to Remote Server via SCP
```powershell
scp -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" frontend-dist.tar.gz ubuntu@210.79.128.247:/var/www/hyper-resume/frontend/
```

### Step 3.4: Extract, Clear Route Cache & Restart PM2
> [!WARNING]
> **CRITICAL NEXT.JS ROUTE CACHE GOTCHA**:
> Next.js standalone stores prerendered HTML in `.next/server/route-cache`. If you update mock data, pages, or components without deleting this directory, Next.js will continue serving stale cached HTML even across PM2 restarts! Always clear `.next/server/route-cache`.

Run this command via SSH:
```bash
ssh -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" ubuntu@210.79.128.247 "
  cd /var/www/hyper-resume/frontend &&
  tar -xzf frontend-dist.tar.gz &&
  rm -rf .next/server/route-cache .next/cache &&
  sudo systemctl reload nginx &&
  sudo pm2 restart hyper-resume-frontend
"
```

---

## ⚙️ 4. Step-by-Step Backend Deployment

When deploying changes to the NestJS backend:

### Step 4.1: Build Locally
```powershell
cd c:\Users\AbhiSingh\Pictures\builder\backend
bun run build
```

### Step 4.2: Package & Upload `dist/`
```powershell
tar -czf backend-dist.tar.gz dist package.json
scp -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" backend-dist.tar.gz ubuntu@210.79.128.247:/var/www/hyper-resume/backend/
```

### Step 4.3: Extract & Restart PM2
```bash
ssh -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" ubuntu@210.79.128.247 "
  cd /var/www/hyper-resume/backend &&
  tar -xzf backend-dist.tar.gz &&
  sudo pm2 restart hyper-resume-backend
"
```

---

## 🗄️ 5. Database Management & Migration

* **Database Engine**: PostgreSQL 16
* **Database Name**: `hyper_resume`
* **Host**: `localhost:5432`

### Connecting to PostgreSQL on the Server
```bash
sudo -u postgres psql -d hyper_resume
```

### Backup / Restore
* **Restore from master SQL backup**:
  ```bash
  sudo -u postgres psql -d hyper_resume -f /var/www/hyper-resume/hyper_resume_db_backup.sql
  ```
* **Take new backup**:
  ```bash
  sudo -u postgres pg_dump -d hyper_resume --clean --if-exists > /var/www/hyper-resume/backup_latest.sql
  ```

---

## 🛠️ 6. Useful Server Diagnostic Commands

```bash
# Check PM2 process status
sudo pm2 status

# View live streaming logs
sudo pm2 logs hyper-resume-frontend --lines 100
sudo pm2 logs hyper-resume-backend --lines 100

# Check Nginx configuration & restart
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx

# Check listening ports (3082 for frontend, 3002 for backend, 5432 for Postgres)
sudo ss -tulpn | grep -E '3082|3002|5432|80|443'

# Test local upstream endpoints
curl -I http://127.0.0.1:3082
curl -I http://127.0.0.1:3002/api/v1/health
```

---

## 🔒 7. SSL Certificate Management (Let's Encrypt / Certbot)

Certificates auto-renew via systemd timer. To manually test or renew:
```bash
sudo certbot renew --dry-run
```
Certificate files:
* Frontend: `/etc/letsencrypt/live/resume.fourth-coffee.shop/fullchain.pem`
* Backend API: `/etc/letsencrypt/live/resume-api.fourth-coffee.shop/fullchain.pem`
