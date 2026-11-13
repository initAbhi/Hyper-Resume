# ==============================================================================
# Hyper-Resume Automated PostgreSQL Database Backup Script (PowerShell)
# Retention: 14 days rolling window
# ==============================================================================

[CmdletBinding()]
param (
    [string]$DbHost = $env:DATABASE_HOST,
    [string]$DbPort = $env:DATABASE_PORT,
    [string]$DbName = $env:DATABASE_NAME,
    [string]$DbUser = $env:DATABASE_USER,
    [string]$BackupDir = $env:BACKUP_DIR,
    [int]$RetentionDays = 14
)

if (-not $DbHost) { $DbHost = "localhost" }
if (-not $DbPort) { $DbPort = "5432" }
if (-not $DbName) { $DbName = "hyper_resume_db" }
if (-not $DbUser) { $DbUser = "postgres" }
if (-not $BackupDir) { $BackupDir = Join-Path $PSScriptRoot "..\backups\database" }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resolvedBackupDir = [System.IO.Path]::GetFullPath($BackupDir)

if (-not (Test-Path $resolvedBackupDir)) {
    New-Item -ItemType Directory -Path $resolvedBackupDir -Force | Out-Null
}

$backupFile = Join-Path $resolvedBackupDir "hyper_resume_${DbName}_${timestamp}.dump"

Write-Host "[INFO] Starting database backup for '$DbName' on ${DbHost}:${DbPort}..."

$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    # Check common PostgreSQL installation directories on Windows
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe"
    )
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $pgDumpPath = $path
            break
        }
    }
}

if (-not $pgDumpPath) {
    Write-Error "[ERROR] pg_dump utility not found in PATH or standard installation directories."
    exit 1
}

$env:PGPASSWORD = $env:DATABASE_PASSWORD
try {
    & $pgDumpPath -h $DbHost -p $DbPort -U $DbUser -F c -b -f $backupFile $DbName
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile) -and ((Get-Item $backupFile).Length -gt 0)) {
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host ("[SUCCESS] Backup created successfully: {0} ({1:N2} KB)" -f $backupFile, $fileSize)
    } else {
        Write-Error "[ERROR] pg_dump exited with error code $LASTEXITCODE"
        exit 1
    }
} finally {
    $env:PGPASSWORD = $null
}

# Retention cleanup
Write-Host "[INFO] Cleaning up backups older than $RetentionDays days..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $resolvedBackupDir -Filter "hyper_resume_${DbName}_*.dump" | Where-Object {
    $_.LastWriteTime -lt $cutoffDate
} | Remove-Item -Force

Write-Host "[SUCCESS] Backup workflow completed."
