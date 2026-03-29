# Nower API - Guía de Configuración del Backend

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu entorno local:

- PHP (v8.2 o superior)
- Composer

---

## Paso 1: Configuración de PHP 

1. Busca tu archivo `php.ini` (usualmente en `C:\php\php.ini` o dentro de la carpeta de instalación de tu entorno local).
2. Ábrelo con cualquier editor de texto y elimina el punto y coma (`;`) al inicio de estas líneas exactas para habilitarlas:

```ini
extension=fileinfo
extension=pdo_pgsql
extension=pgsql
```
---

## Paso 2: Instalar Dependencias

Abre tu terminal dentro de la carpeta `backend` y ejecuta:

```bash
composer install
```

> **Nota:** Si en algún momento da un error de "timeout" con el paquete `laravel/pint`, ignóralo, es solo un formateador de código y no afecta a la API.

---

## Paso 3: Configurar las Variables de Entorno (`.env`)

Crea un archivo nuevo llamado exactamente `.env` (sin extensión `.txt`) en la raíz de la carpeta `backend` y pega la siguiente configuración.

> **Importante:** Crea las variables `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`. También asegúrate de colocar la contraseña correcta de tu usuario local de Postgres en `DB_PASSWORD`.

```env
APP_NAME=NowerAPI
APP_ENV=local
APP_KEY=base64:QwnhiW11F2YnE5HlNLmAnU4DSBP0fNBwbyEraKbZIaw=
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nower_db
DB_USERNAME=postgres
DB_PASSWORD=

# Clerk Configuration
CLERK_PUBLISHABLE_KEY=*********
CLERK_SECRET_KEY=*********
```

## Paso 4: Iniciar el Servidor
Levanta el servidor local de desarrollo de Laravel con el siguiente comando:

```bash
php artisan serve
```

La API ahora estará corriendo en http://localhost:8000.


## Paso 5: Probar que funcione
Para verificar que todo se levantó correctamente, abre tu navegador y entra a la ruta pública de prueba:

http://localhost:8000/api/health

Deberías ver esta respuesta en formato JSON:

```json
{
    "status": "ok",
    "message": "El backend esta funcionando "
}
```