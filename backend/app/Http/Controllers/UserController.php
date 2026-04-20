<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
                'profession' => 'nullable|string|max:80',
                'bio' => 'nullable|string|max:500',
                'imagen_profile' => 'nullable|url|max:255',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            ], [
                'full_name.required' => 'El nombre completo es obligatorio.',
                'full_name.max' => 'El nombre no puede exceder 100 caracteres.',
                'profession.max' => 'La profesión no puede exceder 80 caracteres.',
                'bio.max' => 'La biografía no puede exceder 500 caracteres.',
                'image.image' => 'El archivo debe ser una imagen válida.',
                'image.mimes' => 'Solo se permiten imágenes JPG, JPEG o PNG.',
                'image.max' => 'La imagen no puede exceder 2MB.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación de datos',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Buscar o crear usuario
            $user = User::where('clerk_id', $request->clerk_id)
                ->orWhere('email', $request->email)
                ->first() ?? new User();

            $user->clerk_id = $request->clerk_id;
            $user->full_name = $request->full_name;
            $user->email = $request->email;

            if ($request->filled('profession')) $user->profession = $request->profession;
            if ($request->filled('bio'))   $user->bio = $request->bio;
            if ($request->filled('phone'))  $user->phone = $request->phone;
            if ($request->filled('city'))   $user->city = $request->city;

            $user->role = $request->role ?? $user->role ?? 'user';
            $user->save();

            // ─── Manejo de imagen ────────────────────────────────────────────

            // Opción A: la URL de imagen viene directa (desde Clerk u otro proveedor)
            if ($request->filled('imagen_profile')) {
                $user->imagen_profile = $request->input('imagen_profile');
                $user->save();

            // Opción B: se sube un archivo — se manda a Cloudinary, NUNCA a disco local
            } elseif ($request->hasFile('image')) {
                Log::info('ENTRA A CLOUDINARY', [
                    'filename' => $request->file('image')->getClientOriginalName(),
                    'size' => $request->file('image')->getSize(),
                ]);

                $file = $request->file('image');

                // Generar public_id limpio para Cloudinary
                $publicId = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $user->full_name))
                    . '_' . $user->id . '_' . time();

                try {
                    $cloudinary   = new CloudinaryService();
                    $uploadResult = $cloudinary->upload($file, $publicId);

                    // Guardar solo la URL de Cloudinary (secure_url con HTTPS)
                    $user->imagen_profile = $uploadResult['url'];
                    $user->save();

                } catch (\Exception $e) {
                    Log::error('Cloudinary upload failed', [
                        'user_id' => $user->id,
                        'error'   => $e->getMessage(),
                    ]);

                    // NO hay fallback local — devolvemos error para que el equipo lo sepa
                    return response()->json([
                        'success' => false,
                        'message' => 'Error al subir la imagen a Cloudinary. '
                            . 'Verifica las variables CLOUDINARY_* en tu .env',
                        'error'   => config('app.debug') ? $e->getMessage() : null,
                    ], 500);
                }
            }

            // ─────────────────────────────────────────────────────────────────

            return response()->json([
                'success' => true,
                'message' => 'Usuario sincronizado correctamente',
                'user'    => $user,
            ]);

        } catch (\Exception $e) {
            Log::error('UserController@sync error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

}