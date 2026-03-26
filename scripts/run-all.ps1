param(
  [int]$BackendPort = 8080,
  [string]$ViteHost = "localhost"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

$backendScript = Join-Path $root "scripts\run-backend.ps1"
$frontendScript = Join-Path $root "scripts\run-frontend.ps1"

if (-not (Test-Path $backendScript)) { throw "No existe: $backendScript" }
if (-not (Test-Path $frontendScript)) { throw "No existe: $frontendScript" }

Write-Host "Arrancando backend y frontend..." -ForegroundColor Cyan

$backendProc = Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $backendScript,
  "-BackendPort", $BackendPort
) -WorkingDirectory $root -WindowStyle Normal -PassThru

$frontendProc = Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $frontendScript,
  "-ViteHost", $ViteHost
) -WorkingDirectory $root -WindowStyle Normal -PassThru

Write-Host "Backend PID: $($backendProc.Id)"
Write-Host "Frontend PID: $($frontendProc.Id)"
Write-Host "Cuando termines, cierra esas consolas." 

