<?php
// public/api/auth/google.php

// 1. Cabeceras CORS (Cambia el localhost:3000 si tu React usa otro puerto)
header("Access-Control-Allow-Origin: http://localhost:3000");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Si es pre-flight de React, responder OK y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Cargar dependencias de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

// Cargar el .env.development (Asegúrate de tener este archivo en la raíz con tu GOOGLE_CLIENT_ID)
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 3), '.env.development');
$dotenv->load();

try {
    // 3. Recibir el token de React
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (!isset($data['credential'])) {
        http_response_code(400);
        echo json_encode(["error" => "No se recibió el token de Google."]);
        exit;
    }

    // SOLUCIÓN RÁPIDA (Solo para desarrollo local / NO USAR EN PRODUCCIÓN)
    $httpClient = new GuzzleHttp\Client([
        'verify' => false
    ]);
    $client = new Google_Client(['client_id' => $_ENV['GOOGLE_CLIENT_ID']]);
    $client->setHttpClient($httpClient);
    $payload = $client->verifyIdToken($data['credential']);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(["error" => "Token inválido o expirado."]);
        exit;
    }

    // 5. ¡HU Cumplida! Devolvemos los datos del usuario al frontend
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login exitoso",
        "user" => [
            "id" => $payload['sub'], // ID único de Google (puedes usarlo como ID temporal)
            "email" => $payload['email'],
            "name" => $payload['name'],
            "avatar" => $payload['picture'] ?? null
        ]
    ]);

}
catch (Exception $e) {
    // Error de servidor
    http_response_code(500);
    echo json_encode(["error" => "Error interno: " . $e->getMessage()]);
}