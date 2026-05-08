<?php

/**
 * Configuración de SSL para desarrollo
 * Este archivo se ejecuta automáticamente al iniciar la aplicación
 */

if (env('APP_ENV') === 'local') {
    // Deshabilitar verificación SSL para cURL en ambiente de desarrollo (Windows)
    $defaults = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ]
    ];
    
    stream_context_set_default($defaults);
}
