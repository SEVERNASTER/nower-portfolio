# BackendTis (PHP + PostgreSQL)

Backend REST para el portfolio (pensado para conectar con tu frontend en `localhost`).

## Requisitos

- PHP 8.x
- Extensiones PHP: `pdo` y `pdo_pgsql`
- PostgreSQL

## Estructura

- `public/index.php`: entrypoint (router) para `/api/*`
- `src/`: helpers (env/config/db/auth) y repositorio con queries
- `migrations/001_init.sql`: esquema + datos seed

## Configuración

1. Copia `BackendTis/.env.example` a `BackendTis/.env`
2. Ajusta credenciales y `AUTH_SECRET`

## Migraciones (esquema + seed)

En tu terminal:

```powershell
psql "host=localhost port=5432 dbname=nower_portfolio user=postgres" -f "migrations/001_init.sql"


.\scripts\migrate.ps1
```

Si tu DB no existe:

```powershell
createdb nower_portfolio
```

## Correr en `localhost`

Desde `BackendTis`:

```powershell
php -S localhost:8080 -t public

.\scripts\run-backend.ps1 -BackendPort 8080
```

Ahora el backend responde en:

- `http://localhost:8080/api/auth/login`
- `http://localhost:8080/api/profile`
- `http://localhost:8080/api/projects`
- `http://localhost:8080/api/skills`
- `http://localhost:8080/api/experience`

También hay endpoint placeholder:

- `GET http://localhost:8080/api/placeholder/150/150`

## Autenticación

- `POST /api/auth/login` devuelve un `token`
- El resto de endpoints usan `Authorization: Bearer <token>`

Credenciales seed (local):

- email: `admin@gmail.com`
- password: `123`

> Nota: esto es para desarrollo. En producción deberías usar HTTPS, rate limiting y tokens JWT firmados con rotación de secretos.

