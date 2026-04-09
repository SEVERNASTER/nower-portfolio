<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function sync(Request $request)
    {
        try {
            // Validaciones
            $validator = Validator::make($request->all(), [
                'clerk_id' => 'required|string',
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:150',
                'profession' => 'nullable|string|max:80',
                'bio' => 'nullable|string|max:500',
            ], [
                'full_name.required' => 'El nombre completo es obligatorio.',
                'full_name.max' => 'El nombre no puede exceder 100 caracteres.',
                'profession.max' => 'La profesión no puede exceder 80 caracteres.',
                'bio.max' => 'La biografía no puede exceder 500 caracteres.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación de datos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear o Actualizar
            $user = User::updateOrCreate(
                ['clerk_id' => $request->clerk_id],
                [
                    'full_name' => $request->full_name,
                    'email' => $request->email,
                    'profession' => $request->profession ?? null,
                    'bio' => $request->bio ?? null,
                    'role' => $request->role ?? 'user',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Perfil sincronizado correctamente',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            // Manejo de errores de servidor (Ej: BD caída)
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error interno en el servidor.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error 500'
            ], 500);
        }
    }
}