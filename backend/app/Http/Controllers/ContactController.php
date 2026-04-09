<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ContactController extends Controller
{
    public function updateContact(Request $request)
    {
        try {
            $request->validate([
                'clerk_id' => 'required|string',
                'phone' => ['required', 'digits:8'],
                'city' => 'required|string|max:100',
            ], [
                'phone.digits' => 'El teléfono debe tener 8 dígitos',
                'city.required' => 'La ciudad es obligatoria',
            ]);

            $user = User::where('clerk_id', $request->clerk_id)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $user->update([
                'phone' => $request->phone,
                'city' => $request->city,
            ]);

            return response()->json([
                'message' => 'Contacto actualizado correctamente',
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