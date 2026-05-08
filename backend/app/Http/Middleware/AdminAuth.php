<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class AdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Se asume que ClerkAuth ya validó el token e inyectó 'clerk_user_id'
        $clerkId = $request->attributes->get('clerk_user_id');

        if (!$clerkId) {
            return response()->json(['error' => 'No autorizado. Falta el ID de Clerk en el middleware anterior.'], 401);
        }

        $user = User::where('clerk_id', $clerkId)->first();

        // Validar si el usuario existe y su rol es 'admin'
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado. Se requieren permisos de administrador.'], 403);
        }

        // Compartir el modelo de usuario para uso global si se necesita
        $request->attributes->add(['auth_user' => $user]);

        return $next($request);
    }
}
