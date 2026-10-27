# Database Architecture, Schema & Backup Procedures

**Database Engine**: PostgreSQL 16.3  
**Database Name**: `hyper_resume`  
**Host**: `localhost:5432` on server `210.79.128.247`  
**Master Dump File**: `hyper_resume_db_backup.sql` (103,226 bytes in workspace root)  
**ORM Framework**: TypeORM 0.3.x with TypeScript entities  
**Status**: 🟢 Fully Synchronized & Operational  

---

## 1. Relational Schema & Entity Directory

All database entities are defined in `backend/src/database/entities.ts` and managed via TypeORM:

| Entity Name | Table Name | Primary Key | Key Foreign Keys | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `User` | `users` | UUID | None | User accounts, auth hashes, roles, and credit balances |
| `UserSession` | `user_sessions` | UUID | `user_id` -> `users.id` | Active JWT refresh tokens, IP addresses, user agents |
| `CandidateProfile` | `candidate_profiles`| UUID | `user_id` -> `users.id` | Master candidate career data, contact info, and links |
| `Resume` | `resumes` | UUID | `user_id` -> `users.id` | Root resume documents with JSONB sections and ATS scores |
| `ResumeVersion` | `resume_versions` | UUID | `resume_id` -> `resumes.id`| Point-in-time snapshots for version history and reversion |
| `ResumeAnalysis` | `resume_analyses` | UUID | `resume_id` -> `resumes.id`| 100-point ATS score reports, missing skill audits |
| `JobDescription` | `job_descriptions`| UUID | `user_id` -> `users.id` | Captured job specs from LinkedIn, Greenhouse, etc. |
| `JobMatch` | `job_matches` | UUID | `resume_id`, `job_description_id` | Match percentage, keyword gaps, and tailoring tips |
| `Template` | `templates` | UUID | None | Base layout presets (Classic Tech, Executive, Modern) |
| `JobApplication` | `job_applications`| UUID | `user_id`, `resume_id` | Application tracking CRM (Kanban stages, interview notes) |
| `CreditLedger` | `credit_ledgers` | UUID | `user_id` -> `users.id` | Immutable ledger of credit debits, grants, and purchases |
| `Payment` | `payments` | UUID | `user_id` -> `users.id` | Stripe checkout sessions, receipts, and plan subscriptions |

---

## 2. Master Backup Snapshot (`hyper_resume_db_backup.sql`)

The repository includes a verified SQL dump `hyper_resume_db_backup.sql` captured from the local development database and restored onto the production server.

### 2.1 Backup Contents
* **Schema DDL**: Full `CREATE TABLE`, `CREATE INDEX`, and foreign key constraint statements.
* **Pre-Loaded Test Accounts**:
  * Demo Account: `demo@hyperresume.ai` (Password: `demo123`)
  * Credit Ledger: 33 initial credits pre-allocated to the demo account.
* **Master Sample Templates**: Default ATS template geometries and configurations.
* **Application Tracker Records**: Sample job applications across Wishlist, Applied, Screening, and Offer stages for immediate dashboard visualization.

---

## 3. Database Backup & Restore Operations

### 3.1 Creating a New Backup (Dump)
To take a complete snapshot of the production database:

```bash
# SSH into production server
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@210.79.128.247

# Dump database to a timestamped SQL file
sudo -u postgres pg_dump -d hyper_resume --clean --if-exists > /var/www/hyper-resume/backup_$(date +%Y%m%d_%H%M%S).sql

# (Optional) Download to local machine
scp -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@210.79.128.247:/var/www/hyper-resume/backup_*.sql ./
```

### 3.2 Restoring Database from Backup
To restore a backup into a fresh or existing database:

```bash
# 1. Drop and recreate database (CAUTION: Destructive)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS hyper_resume;"
sudo -u postgres psql -c "CREATE DATABASE hyper_resume OWNER postgres;"

# 2. Restore schema and data from backup file
sudo -u postgres psql -d hyper_resume -f /var/www/hyper-resume/hyper_resume_db_backup.sql

# 3. Verify tables and record counts
sudo -u postgres psql -d hyper_resume -c "\dt"
sudo -u postgres psql -d hyper_resume -c "SELECT email, credit_balance FROM users;"
```

---

## 4. Performance Tuning & Indexes

The PostgreSQL database is optimized for quick JSONB querying and sub-second ATS score loading:

1. **GIN Index on JSONB Columns**:
   ```sql
   CREATE INDEX idx_resumes_skills ON resumes USING gin ((skills));
   CREATE INDEX idx_resumes_work_experience ON resumes USING gin ((work_experience));
   ```
2. **Compound Index on User Resumes**:
   ```sql
   CREATE INDEX idx_resumes_user_updated ON resumes (user_id, updated_at DESC);
   ```
3. **Foreign Key Cascades**:
   `ON DELETE CASCADE` is enforced on `resume_versions`, `resume_analyses`, and `user_sessions` to ensure zero orphaned records when a resume or user account is deleted.
