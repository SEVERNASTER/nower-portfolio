param(
  [string]$EnvPath = "BackendTis\.env",
  [string]$SqlPath = "BackendTis\migrations\001_init.sql"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root $EnvPath
$sqlFile = Join-Path $root $SqlPath

if (-not (Test-Path $envFile)) {
  throw "No existe $envFile. Crea `BackendTis\.env` (copia desde `BackendTis\.env.example`)."
}

if (-not (Test-Path $sqlFile)) {
  throw "No existe el SQL: $sqlFile"
}

$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
  Write-Host "No encuentro `psql` en PATH. Necesitas instalar PostgreSQL Client o agregarlo al PATH." -ForegroundColor Red
  Write-Host "Alternativa: usa pgAdmin -> Query Tool y ejecuta el archivo $sqlFile"
  exit 1
}

# Parseo simple de .env (KEY=VALUE)
$kv = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq "" -or $line.StartsWith("#")) { return }
  $pos = $line.IndexOf("=")
  if ($pos -lt 0) { return }
  $k = $line.Substring(0, $pos).Trim()
  $v = $line.Substring($pos + 1).Trim().Trim('"').Trim("'")
  $kv[$k] = $v
}

$dbHost = $kv["DB_HOST"]; if (-not $dbHost) { $dbHost = "localhost" }
$port = $kv["DB_PORT"]; if (-not $port) { $port = "5432" }
$db = $kv["DB_NAME"]; if (-not $db) { $db = "nower_portfolio" }
$user = $kv["DB_USER"]; if (-not $user) { $user = "postgres" }
$pass = $kv["DB_PASSWORD"]; if (-not $pass) { $pass = "" }

if ($pass -ne "") {
  $env:PGPASSWORD = $pass
}

Write-Host "Ejecutando migración SQL en PostgreSQL..." -ForegroundColor Green
Write-Host "DB: $db ($user@${dbHost}:${port})"

# Ejecuta el SQL
& psql -h $dbHost -p $port -U $user -d $db -f $sqlFile

Write-Host "Migración finalizada." -ForegroundColor Green

