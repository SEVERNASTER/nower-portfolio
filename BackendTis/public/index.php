<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Env.php';

loadEnv(__DIR__ . '/../.env');

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Http.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/PortfolioRepository.php';

requireJson();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawPath = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($rawPath, PHP_URL_PATH) ?: '/';
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

$repo = new PortfolioRepository();

function requireAuth(): array
{
    $token = bearerToken();
    if ($token === null) {
        // Token almacenado como cookie (por frontend vía localhost/Vite proxy)
        $token = $_COOKIE['nower_token'] ?? null;
    }

    if (!is_string($token) || $token === '') {
        jsonResponse(['error' => 'Unauthorized'], 401);
        exit;
    }

    $payload = verifyToken($token);
    if ($payload === []) {
        jsonResponse(['error' => 'Unauthorized'], 401);
        exit;
    }

    if (!isset($payload['pid']) || !is_string($payload['pid'])) {
        jsonResponse(['error' => 'Unauthorized'], 401);
        exit;
    }

    return $payload;
}

// 1) Auth
if ($method === 'POST' && $path === '/api/auth/login') {
    $body = readJsonBody();
    $email = (string)($body['email'] ?? '');
    $password = (string)($body['password'] ?? '');

    if ($email === '' || $password === '') {
        jsonResponse(['error' => 'Missing email or password'], 400);
        exit;
    }

    $user = $repo->login($email, $password);
    if ($user === null) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
        exit;
    }

    $ttl = tokenTtlSeconds();
    $token = createToken([
        'sub' => $user['userId'],
        'pid' => $user['profileId'],
        'role' => $user['role'],
        'exp' => time() + $ttl,
    ]);

    // Guardar el token también en cookie para que el frontend no use sessionStorage.
    // Nota: en desarrollo (localhost) no usamos Secure para evitar bloqueos por navegador.
    setcookie(
        'nower_token',
        $token,
        [
            'expires' => time() + $ttl,
            'path' => '/api',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => false,
        ]
    );

    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => $user['userId'],
            'name' => $user['name'] ?? null,
            'email' => $user['email'],
            'role' => $user['role'],
            'profileId' => $user['profileId'],
        ],
    ]);
    exit;
}

if ($method === 'POST' && $path === '/api/auth/register') {
    $body = readJsonBody();
    $name = (string)($body['name'] ?? '');
    $email = (string)($body['email'] ?? '');
    $password = (string)($body['password'] ?? '');

    if (trim($name) === '' || trim($email) === '' || $password === '') {
        jsonResponse(['error' => 'Missing name, email or password'], 400);
        exit;
    }

    try {
        $user = $repo->register($name, $email, $password);
    } catch (\RuntimeException $e) {
        if ($e->getMessage() === 'EMAIL_TAKEN') {
            jsonResponse(['error' => 'Email already registered'], 409);
            exit;
        }
        jsonResponse(['error' => 'Register failed'], 500);
        exit;
    } catch (\Throwable $e) {
        jsonResponse(['error' => 'Register failed'], 500);
        exit;
    }

    $ttl = tokenTtlSeconds();
    $token = createToken([
        'sub' => $user['userId'],
        'pid' => $user['profileId'],
        'role' => $user['role'],
        'exp' => time() + $ttl,
    ]);

    setcookie(
        'nower_token',
        $token,
        [
            'expires' => time() + $ttl,
            'path' => '/api',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => false,
        ]
    );

    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => $user['userId'],
            'name' => $user['name'] ?? null,
            'email' => $user['email'],
            'role' => $user['role'],
            'profileId' => $user['profileId'],
        ],
    ], 201);
    exit;
}

// Auth status (para que el frontend detecte sesión desde cookie)
if ($method === 'GET' && $path === '/api/auth/me') {
    $payload = requireAuth();
    jsonResponse([
        'authenticated' => true,
        'pid' => $payload['pid'],
        'role' => $payload['role'] ?? null,
    ]);
    exit;
}

// 2) Placeholder image endpoint (used by mock avatarUrl)
if ($method === 'GET' && preg_match('#^/api/placeholder/(\\d+)/(\\d+)$#', $path, $m)) {
    $w = (int)$m[1];
    $h = (int)$m[2];
    if ($w <= 0 || $h <= 0 || $w > 2000 || $h > 2000) {
        jsonResponse(['error' => 'Invalid dimensions'], 400);
        exit;
    }

    corsHeaders();
    header('Content-Type: image/svg+xml; charset=utf-8');

    $bg1 = '#0ea5e9'; // sky-500
    $bg2 = '#10b981'; // emerald-500
    $text = 'NOWER';

    $svg = sprintf(
        '<?xml version="1.0" encoding="UTF-8"?>' .
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' .
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' .
        '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' .
        '<rect width="%d" height="%d" fill="url(#g)"/>' .
        '<text x="50%%" y="50%%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="%d" fill="white" font-weight="700">%s</text>' .
        '</svg>',
        $w,
        $h,
        $w,
        $h,
        $bg1,
        $bg2,
        $w,
        $h,
        max(14, (int)min($w, $h) * 0.25),
        $text
    );

    echo $svg;
    exit;
}

// 3) Protected endpoints
if (str_starts_with($path, '/api/')) {
    $payload = requireAuth();
    $profileId = (string)$payload['pid'];

    if ($method === 'GET' && $path === '/api/profile') {
        $profile = $repo->getProfile($profileId);
        if ($profile === null) {
            jsonResponse(['error' => 'Profile not found'], 404);
            exit;
        }
        jsonResponse($profile);
        exit;
    }

    if ($method === 'GET' && $path === '/api/projects') {
        jsonResponse($repo->listProjects($profileId));
        exit;
    }

    if ($method === 'GET' && $path === '/api/skills') {
        jsonResponse($repo->listSkills($profileId));
        exit;
    }

    if ($method === 'GET' && $path === '/api/experience') {
        jsonResponse($repo->listExperiences($profileId));
        exit;
    }
}

jsonResponse(['error' => 'Not Found'], 404);
exit;

