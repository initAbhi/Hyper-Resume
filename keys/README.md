# Server Access Keys & Deployment Context

This folder contains the deployment credentials, SSH keys, and operational documentation for the **HyperResume** production cloud server.

## 📁 Folder Contents

* **`id_ed25519`**: OpenSSH Ed25519 private key for `ubuntu@210.79.128.247`.
* **`id_ed25519.pub`**: OpenSSH Ed25519 public key.
* **`DEPLOYMENT_GUIDE.md`**: Complete step-by-step deployment guide for Next.js frontend, NestJS backend, PostgreSQL database, PM2 processes, and Nginx reverse proxy.

## ⚡ Quick Connect

### PowerShell
```powershell
ssh -i "c:\Users\AbhiSingh\Pictures\builder\keys\id_ed25519" ubuntu@210.79.128.247
```

### Git Bash / Linux / macOS
```bash
chmod 600 id_ed25519
ssh -i ./id_ed25519 ubuntu@210.79.128.247
```

For full deployment documentation, see [DEPLOYMENT_GUIDE.md](file:///c:/Users/AbhiSingh/Pictures/builder/keys/DEPLOYMENT_GUIDE.md).
