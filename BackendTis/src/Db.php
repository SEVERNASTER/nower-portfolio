<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s',
        $GLOBALS['DB_HOST'],
        $GLOBALS['DB_PORT'],
        $GLOBALS['DB_NAME']
    );

    $pdo = new PDO(
        $dsn,
        $GLOBALS['DB_USER'],
        $GLOBALS['DB_PASSWORD'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    return $pdo;
}

