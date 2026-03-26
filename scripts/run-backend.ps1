param(
  [int]$BackendPort = 8080
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "BackendTis"
$publicDir = Join-Path $backendDir "public"

if (-not (Test-Path $publicDir)) {
  throw "No existe la carpeta del backend: $publicDir"
}

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  throw "PHP no está disponible en PATH. Instálalo/activa 'Add to PATH' y vuelve a intentar."
}

$envFile = Join-Path $backendDir ".env"
$envExample = Join-Path $backendDir ".env.example"

if (-not (Test-Path $envFile)) {
  if (Test-Path $envExample) {
    Copy-Item -LiteralPath $envExample -Destination $envFile
    Write-Host "Se creó `"$envFile`" desde `.env.example`. Edita valores si aplica."
  } else {
    throw "Faltan archivos de env. No existe: $envExample"
  }
}

Write-Host "Levantando backend en http://localhost:$BackendPort ..."
Write-Host "Directorio público: $publicDir"

Set-Location $publicDir
php -S "localhost:$BackendPort" -t "."

