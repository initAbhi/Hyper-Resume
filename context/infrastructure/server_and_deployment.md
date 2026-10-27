# Server Infrastructure & Cloud Deployment — Operations Guide

**Server Host**: `210.79.128.247`  
**SSH User**: `ubuntu` (Key: `~/.ssh/id_ed25519`)  
**Operating System**: Ubuntu 24.04.4 LTS (Linux 6.8.0-106-generic x86_64)  
**Root Project Directory**: `/var/www/hyper-resume`  
**Process Manager**: PM2 v5.x (Daemon running under `root`)  
**Status**: 🟢 Production Live & Verified  

---

## 1. Server Architecture & Port Mapping

```
                                      Internet
                                          │
                        ┌─────────────────┴─────────────────┐
                        │     Public IP: 210.79.128.247     │
                        └─────────────────┬─────────────────┘
                                          │ Port 80 / 443
                                          ▼
                        ┌───────────────────────────────────┐
                        │          Nginx Web Server         │
                        │    HTTP/2 + Let's Encrypt SSL     │
                        └─────────┬───────────────┬─────────┘
                                  │               │
        proxy_pass http://127.0.0.1:3082          │ proxy_pass http://127.0.0.1:3002
                                  │               │
                                  ▼               ▼
                       ┌────────────────────┐  ┌────────────────────┐
                       │ Next.js Standalone │  │   NestJS Backend   │
                       │ PM2 ID: 14         │  │   PM2 ID: 13       │
                       │ Port 3082          │  │   Port 3002        │
                       └────────────────────┘  └─────────┬──────────┘
                                                         │
                                                         ▼
                                               ┌────────────────────┐
                                               │ PostgreSQL 16 DB   │
                                               │ Port 5432          │
                                               └────────────────────┘
```

---

## 2. Remote Access & Permissions

* **SSH Command**:
  ```bash
  ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@210.79.128.247
  ```
* **Directory Ownership**: Owned by `ubuntu:ubuntu` or `root:root` with read/write permissions for web services.
* **PM2 Root Requirement**: Because PM2 services were initialized under the root account, running `pm2 list` as user `ubuntu` shows an empty list. Always execute PM2 commands with `sudo`:
  ```bash
  sudo pm2 list
  sudo pm2 status
  sudo pm2 restart hyper-resume-frontend
  sudo pm2 restart hyper-resume-backend
  sudo pm2 logs --lines 50
  ```

---

## 3. PM2 Process Configuration

The processes are registered in PM2 with automatic resurrection on server reboot:

| Process ID | Name | Script Path | Mode | Port | Memory | Status |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **14** | `hyper-resume-frontend` | `node server.js` | fork | `3082` | ~89 MB | **online** |
| **13** | `hyper-resume-backend` | `dist/main.js` | fork | `3002` | ~104 MB | **online** |

### 3.1 PM2 Ecosystem Configuration (`/var/www/hyper-resume/ecosystem.config.cjs`)
```javascript
module.exports = {
  apps: [
    {
      name: 'hyper-resume-frontend',
      cwd: '/var/www/hyper-resume/frontend',
      script: 'node',
      args: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3082,
        NEXT_PUBLIC_API_URL: 'https://resume-api.fourth-coffee.shop/api/v1',
      },
    },
    {
      name: 'hyper-resume-backend',
      cwd: '/var/www/hyper-resume/backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'hyper_resume',
        DB_USER: 'postgres',
      },
    },
  ],
};
```

---

## 4. Nginx Reverse Proxy Configuration

Nginx routes incoming domain traffic to the local application ports with HTTP/2 and SSL termination.

### 4.1 Frontend Block (`/etc/nginx/sites-available/resume.fourth-coffee.shop`)
```nginx
server {
    server_name resume.fourth-coffee.shop;

    location / {
        proxy_pass http://127.0.0.1:3082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/resume.fourth-coffee.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resume.fourth-coffee.shop/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name resume.fourth-coffee.shop;
    return 301 https://$host$request_uri;
}
```

### 4.2 Backend API Block (`/etc/nginx/sites-available/resume-api.fourth-coffee.shop`)
```nginx
server {
    server_name resume-api.fourth-coffee.shop;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/resume-api.fourth-coffee.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resume-api.fourth-coffee.shop/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

---

## 5. Deployment & Release Workflow

When deploying new frontend builds to the production server:

1. **Build Frontend Bundle Locally or Remotely**:
   ```bash
   cd frontend
   bun run build
   ```
2. **Transfer Built Files to Remote Server**:
   ```powershell
   tar -czf frontend-dist.tar.gz .next/standalone .next/static public
   scp -i "$env:USERPROFILE\.ssh\id_ed25519" frontend-dist.tar.gz ubuntu@210.79.128.247:/var/www/hyper-resume/frontend/
   ```
3. **Extract and Clear Next.js Route Cache**:
   > [!IMPORTANT]
   > Next.js standalone keeps a static route cache in `.next/server/route-cache`. If you update mock data or static routes without deleting this directory, the server will continue serving stale HTML even after a PM2 restart!

   ```bash
   ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@210.79.128.247 "
     cd /var/www/hyper-resume/frontend &&
     tar -xzf frontend-dist.tar.gz &&
     rm -rf .next/server/route-cache .next/cache &&
     sudo systemctl reload nginx &&
     sudo pm2 restart hyper-resume-frontend
   "
   ```
4. **Health Check Verification**:
   Verify HTTP 200 responses:
   ```bash
   curl -I https://resume.fourth-coffee.shop/examples
   curl -I https://resume-api.fourth-coffee.shop/api/v1/health
   ```
