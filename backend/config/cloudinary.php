<?php

/**
 * Configuración central de Cloudinary.
 *
 * Todos los valores se leen del .env — nunca hardcodeados aquí.
 * Copia .env.example a .env y rellena las cuatro variables de abajo.
 */
return [
    'cloud_name'    => env('CLOUDINARY_CLOUD_NAME'),
    'api_key'       => env('CLOUDINARY_API_KEY'),
    'api_secret'    => env('CLOUDINARY_API_SECRET'),
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', null), // solo necesario para uploads sin firma desde el frontend
];