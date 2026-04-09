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

    public function getProfile(Request $request)
{
    $clerkId = $request->query('clerk_id');

    $user = User::where('clerk_id', $clerkId)->first();

    if (!$user) {
        return response()->json([
            'message' => 'Usuario no encontrado'
        ], 404);
    }

    return response()->json($user);
}

public function updateProfile(Request $request)
{
    $request->validate([
        'clerk_id' => 'required|string',
        'full_name' => 'required|string|max:150',
        'profession' => 'nullable|string|max:100',
        'bio' => 'nullable|string|max:500',
    ]);

    $user = User::where('clerk_id', $request->clerk_id)->first();

    if (!$user) {
        return response()->json([
            'message' => 'Usuario no encontrado'
        ], 404);
    }

    $user->update([
        'full_name' => $request->full_name,
        'profession' => $request->profession,
        'bio' => $request->bio,
    ]);

    return response()->json([
        'message' => 'Perfil actualizado correctamente',
        'user' => $user
    ]);
}
}