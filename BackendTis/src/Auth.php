<?php

declare(strict_types=1);

require_once __DIR__ . '/Config.php';

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function createToken(array $payload): string
{
    $secret = (string)($GLOBALS['AUTH_SECRET'] ?? '');
    if ($secret === '') {
        throw new RuntimeException('AUTH_SECRET is not configured');
    }

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    $payloadB64 = base64UrlEncode($json === false ? '{}' : $json);

    $sig = hash_hmac('sha256', $payloadB64, $secret, true);
    $sigB64 = base64UrlEncode($sig);

    return $payloadB64 . '.' . $sigB64;
}

function verifyToken(string $token): array
{
    $secret = (string)($GLOBALS['AUTH_SECRET'] ?? '');
    if ($secret === '') {
        return [];
    }

    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) {
        return [];
    }

    [$payloadB64, $sigB64] = $parts;

    $expectedSig = hash_hmac('sha256', $payloadB64, $secret, true);
    $expectedSigB64 = base64UrlEncode($expectedSig);

    if (!hash_equals($expectedSigB64, $sigB64)) {
        return [];
    }

    $json = base64UrlDecode($payloadB64);
    $payload = json_decode($json, true);
    if (!is_array($payload)) {
        return [];
    }

    $now = time();
    if (isset($payload['exp']) && is_numeric($payload['exp']) && (int)$payload['exp'] < $now) {
        return [];
    }

    return $payload;
}

function tokenTtlSeconds(): int
{
    return (int)($GLOBALS['TOKEN_TTL_SECONDS'] ?? 3600);
}

