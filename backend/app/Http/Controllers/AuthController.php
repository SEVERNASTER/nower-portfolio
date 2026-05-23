<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ClerkService;
use App\Services\PasswordAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Valida email/contraseña en la BD local y devuelve un token Clerk (estrategia ticket).
     */
    public function login(Request $request, ClerkService $clerkService)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !$user->password || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        if (!$user->clerk_id) {
            return response()->json([
                'message' => 'Tu cuenta no está vinculada. Inicia sesión con Google o contacta al administrador.',
            ], 422);
        }

        if (!config('services.clerk.secret_key')) {
            Log::error('login: CLERK_SECRET_KEY ausente en backend/.env');

            return response()->json([
                'message' => 'El servidor no tiene configurada CLERK_SECRET_KEY. Añádela en backend/.env y reinicia php artisan serve.',
            ], 503);
        }

        try {
            $signInToken = $clerkService->createSignInToken($user->clerk_id);
        } catch (\Throwable $e) {
            Log::error('login: fallo token Clerk', [
                'user_id' => $user->id,
                'clerk_id' => $user->clerk_id,
                'error' => $e->getMessage(),
            ]);

            $message = 'No se pudo completar el inicio de sesión. Intenta de nuevo.';
            if (app()->environment('local')) {
                $message = $e->getMessage();
            }

            return response()->json([
                'message' => $message,
            ], 500);
        }

        return response()->json([
            'sign_in_token' => $signInToken,
            'must_change_password' => (bool) $user->must_change_password,
            'role' => $user->role,
        ]);
    }

    public function me(Request $request)
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $user = User::where('clerk_id', $clerkId)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'must_change_password' => (bool) $user->must_change_password,
            ],
        ]);
    }

    public function assignPassword(
        Request $request,
        PasswordAssignmentService $passwordAssignmentService
    ) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        try {
            $passwordAssignmentService->assign($user);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Credenciales enviadas al correo del usuario.',
        ]);
    }

    public function changePassword(Request $request, ClerkService $clerkService)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ], [
            'new_password.regex' => 'La nueva contraseña debe incluir mayúscula, minúscula, número y carácter especial.',
            'new_password.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ]);

        $clerkId = $request->attributes->get('clerk_user_id');
        $user = User::where('clerk_id', $clerkId)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        if (!$user->password) {
            return response()->json([
                'message' => 'No tienes una contraseña asignada en el sistema. Contacta al administrador.',
            ], 422);
        }

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta.',
            ], 422);
        }

        if (!$user->clerk_id) {
            return response()->json([
                'message' => 'Tu cuenta no está vinculada a Clerk. Contacta al administrador.',
            ], 422);
        }

        try {
            $clerkService->updatePassword($user->clerk_id, $validated['new_password']);
        } catch (\Throwable $e) {
            Log::error('changePassword: fallo sync Clerk', [
                'user_id' => $user->id,
                'clerk_id' => $user->clerk_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo sincronizar la contraseña con el sistema de acceso. Intenta de nuevo.',
            ], 500);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->must_change_password = false;
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
            'must_change_password' => false,
        ]);
    }
}
