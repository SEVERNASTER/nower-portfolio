<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';

function corsHeaders(): void
{
    $origin = (string)($GLOBALS['CORS_ALLOW_ORIGIN'] ?? 'http://localhost:5173');
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
}

function jsonResponse(mixed $data, int $status = 200): void
{
    corsHeaders();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function bearerToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!is_string($header) || $header === '') {
        return null;
    }

    // Typical: "Bearer <token>"
    if (stripos($header, 'Bearer ') === 0) {
        $token = trim(substr($header, 7));
        return $token !== '' ? $token : null;
    }

    return null;
}

function requireJson(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        corsHeaders();
        http_response_code(204);
        exit;
    }
}

