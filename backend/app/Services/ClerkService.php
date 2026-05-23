<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClerkService
{
    public function updatePassword(string $clerkUserId, string $plainPassword): void
    {
        $secretKey = config('services.clerk.secret_key');

        if (!$secretKey) {
            Log::warning('CLERK_SECRET_KEY no configurada; no se actualizó la contraseña en Clerk.');
            return;
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->patch("https://api.clerk.com/v1/users/{$clerkUserId}", [
                'password' => $plainPassword,
                'skip_password_checks' => true,
            ]);

        if (!$response->successful()) {
            Log::error('Error al actualizar contraseña en Clerk', [
                'clerk_id' => $clerkUserId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new \RuntimeException(
                'No se pudo sincronizar la contraseña con Clerk: ' . ($response->json('errors.0.message') ?? $response->body())
            );
        }
    }

    /**
     * Crea un token de inicio de sesión de un solo uso (estrategia ticket en el frontend).
     */
    public function createSignInToken(string $clerkUserId, int $expiresInSeconds = 120): string
    {
        $secretKey = config('services.clerk.secret_key');

        if (!$secretKey) {
            throw new \RuntimeException('CLERK_SECRET_KEY no configurada.');
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->post('https://api.clerk.com/v1/sign_in_tokens', [
                'user_id' => $clerkUserId,
                'expires_in_seconds' => $expiresInSeconds,
            ]);

        if (!$response->successful()) {
            Log::error('Error al crear sign-in token en Clerk', [
                'clerk_id' => $clerkUserId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new \RuntimeException(
                'No se pudo crear la sesión de acceso: ' . ($response->json('errors.0.message') ?? $response->body())
            );
        }

        $token = $response->json('token');

        if (!is_string($token) || $token === '') {
            throw new \RuntimeException('Clerk no devolvió un token de inicio de sesión válido.');
        }

        return $token;
    }
}
