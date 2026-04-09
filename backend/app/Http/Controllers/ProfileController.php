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
            'phone' => 'required|string|max:20',
            'city' => 'required|string|max:100',
        ], [
            'phone.required' => 'El teléfono es obligatorio.',
            'phone.max' => 'El teléfono es demasiado largo.',
            'city.required' => 'La ciudad es obligatoria.',
            'city.max' => 'La ciudad es demasiado larga.',
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