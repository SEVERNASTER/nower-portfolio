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
                'skip_password_checks' => false,
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
}
