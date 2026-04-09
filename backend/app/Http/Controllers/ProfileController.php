<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    // 🔹 GET /profile
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

    // 🔹 PUT /profile
    public function updateProfile(Request $request)
    {
        $request->validate([
            'clerk_id' => 'required|string',
            'full_name' => 'required|string|max:150',
            'profession' => 'required|string|max:100',
            'bio' => 'required|string|max:500',
            'phone' => ['required', 'digits:8'],
            'city' => 'required|string|max:100',
        ], [
            'full_name.required' => 'El nombre es obligatorio.',
            'profession.required' => 'La profesión es obligatoria.',
            'bio.required' => 'La biografía es obligatoria.',
            'phone.digits' => 'El teléfono debe tener exactamente 8 dígitos numéricos.',
            'city.required' => 'La ciudad es obligatoria.',
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
            'phone' => $request->phone,
            'city' => $request->city,
        ]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
} 