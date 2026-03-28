<?php

declare(strict_types=1);

require_once __DIR__ . '/Env.php';

$AUTH_SECRET = (string)env('AUTH_SECRET', 'change_me_dev_only_use_a_long_random_string');
$TOKEN_TTL_SECONDS = (int)env('TOKEN_TTL_SECONDS', '3600');

$CORS_ALLOW_ORIGIN = (string)env('CORS_ALLOW_ORIGIN', 'http://localhost:5173');

$DB_HOST = (string)env('DB_HOST', 'localhost');
$DB_PORT = (string)env('DB_PORT', '5432');
$DB_NAME = (string)env('DB_NAME', 'nower_portfolio');
$DB_USER = (string)env('DB_USER', 'postgres');
$DB_PASSWORD = (string)env('DB_PASSWORD', 'postgres');

// Provide as globals so they are easy to consume from small PHP files.
$GLOBALS['AUTH_SECRET'] = $AUTH_SECRET;
$GLOBALS['TOKEN_TTL_SECONDS'] = $TOKEN_TTL_SECONDS;
$GLOBALS['CORS_ALLOW_ORIGIN'] = $CORS_ALLOW_ORIGIN;
$GLOBALS['DB_HOST'] = $DB_HOST;
$GLOBALS['DB_PORT'] = $DB_PORT;
$GLOBALS['DB_NAME'] = $DB_NAME;
$GLOBALS['DB_USER'] = $DB_USER;
$GLOBALS['DB_PASSWORD'] = $DB_PASSWORD;

