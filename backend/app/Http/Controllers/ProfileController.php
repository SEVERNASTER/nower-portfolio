<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    // 🔹 GET /profile
    public function getProfile(Request $request)
    {
        try {
            if (!$request->has('clerk_id')) {
                return response()->json([
                    'message' => 'clerk_id es requerido'
                ], 400);
            }

            $user = User::where('clerk_id', $request->clerk_id)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'user' => [
                    'full_name' => $user->full_name,
                    'profession' => $user->profession,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'city' => $user->city,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // 🔹 PUT /profile
    public function updateProfile(Request $request)
    {
        try {
            $request->validate([
                'clerk_id' => 'required|string',
                'full_name' => 'required|string|max:150',
                'profession' => 'required|string|max:100',
                'bio' => 'required|string|max:500',
            ]);

            $user = User::updateOrCreate(
                ['clerk_id' => $request->clerk_id],
                [
                    'full_name' => $request->full_name,
                    'profession' => $request->profession,
                    'bio' => $request->bio,
                ]
            );

            return response()->json([
                'message' => 'Perfil actualizado correctamente',
                'user' => $user
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno',
            ], 500);
        }
    }
}