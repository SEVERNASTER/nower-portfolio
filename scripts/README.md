# Scripts (PowerShell)

Carpeta para levantar el proyecto rápido en `localhost`:

- `run-backend.ps1`: levanta PHP (backend) en `http://localhost:8080`
- `run-frontend.ps1`: levanta Vite/React
- `run-all.ps1`: levanta backend + frontend juntos
- `migrate.ps1`: ejecuta la migración SQL de `BackendTis/migrations/001_init.sql` en PostgreSQL

Notas:
- `migrate.ps1` usa el comando `psql`. Si `psql` no está instalado en tu PATH, el script te lo indicará.
- El backend usa `BackendTis/.env`. Si no existe, el script copia `BackendTis/.env.example` a `BackendTis/.env`.

