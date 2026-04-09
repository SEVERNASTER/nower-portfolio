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
            // Validaciones básicas (SOLO identidad)
            $validator = Validator::make($request->all(), [
                'clerk_id' => 'required|string',
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:150',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear o actualizar usuario
            $user = User::updateOrCreate(
                ['clerk_id' => $request->clerk_id],
                [
                    'full_name' => $request->full_name,
                    'email' => $request->email,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Usuario sincronizado correctamente',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}