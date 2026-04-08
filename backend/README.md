# Nower API - Guía de Configuración del Backend

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu sistema:

- **PHP** (v8.2 o superior)
- **Composer**
- **PostgreSQL** (Instalado localmente y en funcionamiento)

---

## Paso 1: Configuración de PHP

Para que Laravel pueda comunicarse con PostgreSQL, necesitas habilitar ciertos controladores en tu instalación de PHP.

1. Busca tu archivo `php.ini` (comúnmente se encuentra en la carpeta donde instalaste PHP o dentro de tu entorno local como XAMPP/Laragon).

2. Ábrelo con un editor de texto y busca las siguientes líneas. Elimina el punto y coma (`;`) que aparece al principio de cada una para activarlas:

```ini
extension=fileinfo
extension=pdo_pgsql
extension=pgsql
```

3. Guarda el archivo y cierra el editor.

## Paso 2: Instalación de Dependencias

Abre una terminal en la carpeta raíz del proyecto y ejecuta el siguiente comando para descargar las librerías necesarias:

```bash
composer install
```

## Paso 3: Configuración del Entorno (.env)

Laravel utiliza un archivo llamado `.env` para guardar configuraciones sensibles como contraseñas y claves de acceso.

1. Copia el contenido del archivo `.env.example` y crea un nuevo archivo llamado `.env` en la misma carpeta.

2. Genera una clave de seguridad única para tu aplicación ejecutando:

```bash
php artisan key:generate
```


3. Configura la conexión a tu base de datos local. Asegúrate de que los siguientes valores coincidan con tu instalación de PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nower_db
DB_USERNAME=postgres
DB_PASSWORD=TuContraseñaDePostgres
```

Asegúrate de completar las llaves de Clerk que se proporcionaron:

```env
CLERK_PUBLISHABLE_KEY=tu_llave_publica
CLERK_SECRET_KEY=tu_llave_secreta
```

**Paso 4: Preparación de la Base de Datos**

Antes de ejecutar el servidor, debes preparar la base de datos para que tenga la estructura que definimos en los modelos.

1. Abre tu herramienta de gestión de base de datos (como pgAdmin o la terminal de Postgres) y crea una base de datos vacía llamada exactamente `nower_db`.

2. En la terminal de tu proyecto, ejecuta las migraciones. Este comando leerá el código de Laravel y creará las tablas automáticamente en tu PostgreSQL:

```bash
php artisan migrate
```

**Paso 5: Iniciar el Servidor**

Para poner en marcha la API, ejecuta el siguiente comando:

```bash
php artisan serve
```

El backend estará disponible en `http://localhost:8000`.

**Paso 6: Verificación de Funcionamiento**

Para comprobar que el servidor y la base de datos están conectados correctamente, abre tu navegador y visita:

```text
http://localhost:8000/api/health
```

Si todo está bien configurado, recibirás un mensaje confirmando que el estado es "ok". Si recibes un mensaje de error, revisa nuevamente que tu usuario y contraseña en el archivo `.env` sean los mismos que configuraste al instalar PostgreSQL.
