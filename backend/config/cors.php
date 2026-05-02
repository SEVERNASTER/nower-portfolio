<?php

/**
 * config/cors.php
 *
 * Configuración CORS para Laravel 11.
 * Ajusta 'allowed_origins' según tu entorno.
 */
return [

    /*
     * Rutas a las que aplica CORS.
     * 'api/*' cubre todos tus endpoints del backend.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Orígenes permitidos.
     * En producción reemplaza '*' por tu dominio real,
     * ej: ['https://tuapp.com']
     */
    'allowed_origins' => [
        'http://localhost:5173',   // Vite dev server
        'http://127.0.0.1:5173',   // Alternativa local
        'http://localhost:3000',   // Por si alguien usa otro puerto
    ],

    'allowed_origins_patterns' => [
        '/^http:\/\/localhost(:[0-9]+)?$/',
        '/^http:\/\/127\.0\.0\.1(:[0-9]+)?$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    /*
     * Max age en segundos que el navegador cachea la respuesta preflight.
     * 0 = sin caché (útil en desarrollo).
     */
    'max_age' => 0,

    /*
     * true si el frontend envía cookies o headers de autenticación
     * (ej: Authorization). Requiere que allowed_origins NO sea ['*'].
     */
    'supports_credentials' => true,

];