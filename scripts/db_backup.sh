#!/usr/bin/env bash
# ==============================================================================
# Hyper-Resume Automated PostgreSQL Database Backup Script
# Retention: 14 days rolling window
# ==============================================================================

set -euo pipefail

# Configuration with environment defaults
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-hyper_resume_db}"
DB_USER="${DATABASE_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-./backups/database}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/hyper_resume_${DB_NAME}_${TIMESTAMP}.dump"

# Ensure backup destination directory exists
mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting database backup for '${DB_NAME}' on ${DB_HOST}:${DB_PORT}..."

if ! command -v pg_dump &> /dev/null; then
    echo "[ERROR] pg_dump utility not found in PATH. Please install PostgreSQL client tools." >&2
    exit 1
fi

# Execute pg_dump with custom compressed archive format (-Fc)
export PGPASSWORD="${DATABASE_PASSWORD:-}"
pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -F c \
    -b \
    -v \
    -f "${BACKUP_FILE}" \
    "${DB_NAME}" 2>/dev/null

unset PGPASSWORD

if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    FILE_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
    echo "[SUCCESS] Backup created successfully: ${BACKUP_FILE} (${FILE_SIZE})"
else
    echo "[ERROR] Backup failed or generated an empty file." >&2
    exit 1
fi

# Retention policy: Prune backups older than retention window
echo "[INFO] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "hyper_resume_${DB_NAME}_*.dump" -mtime +"${RETENTION_DAYS}" -delete

echo "[SUCCESS] Backup workflow completed."

