param(
  [string]$ViteHost = "localhost"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $root "frontend"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm no está disponible en PATH. Instala Node.js / npm."
}

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
  Write-Host "No existe `node_modules` en $frontendDir. Instalando dependencias (npm install)..." -ForegroundColor Yellow
  Set-Location $frontendDir
  npm install
}

Write-Host "Levantando frontend (Vite/React) en http://$ViteHost:5173 ..."
Set-Location $frontendDir

# Vite corre con proxy /api -> backend (ya configurado en `vite.config.js`)
npm run dev -- --host $ViteHost

