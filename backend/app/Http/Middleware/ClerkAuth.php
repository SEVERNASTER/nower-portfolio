<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class ClerkAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Grab the token from the React request header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'No autorizado. Falta el token.'], 401);
        }

        try {
            $secretKey = env('CLERK_SECRET_KEY');

            $tokenParts = explode('.', $token);
            $payload = json_decode(base64_decode($tokenParts[1]));

            if (!isset($payload->sub)) {
                throw new Exception('Token inválido');
            }

            // Inject the Clerk User ID into the request so use it in database
            $request->attributes->add(['clerk_user_id' => $payload->sub]);

            return $next($request);

        } catch (Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado.', 'details' => $e->getMessage()], 401);
        }
    }
}