<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    public function saveContact(Request $request)
    {
        // Validación
        $request->validate([
            'clerk_id' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
        ]);

        // Buscar usuario
        $user = User::where('clerk_id', $request->clerk_id)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Actualizar datos
        $user->update([
            'phone' => $request->phone,
            'city' => $request->city,
        ]);

        return response()->json([
            'message' => 'Contacto guardado correctamente',
            'user' => $user
        ]);
    }
}