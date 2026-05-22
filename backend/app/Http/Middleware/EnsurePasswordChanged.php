<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next)
    {
        $clerkId = $request->attributes->get('clerk_user_id');

        if (!$clerkId) {
            return response()->json(['message' => 'No autorizado.'], 401);
        }

        $user = User::where('clerk_id', $clerkId)->first();

        if ($user && $user->must_change_password) {
            return response()->json([
                'message' => 'Debes cambiar tu contraseña asignada antes de continuar.',
                'must_change_password' => true,
            ], 403);
        }

        return $next($request);
    }
}
