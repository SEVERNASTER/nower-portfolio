<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PasswordAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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

    public function changePassword(Request $request)
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

        $user->password = Hash::make($validated['new_password']);
        $user->must_change_password = false;
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
}
