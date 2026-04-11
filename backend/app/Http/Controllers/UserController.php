<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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
                    'errors' => $validator->errors(),
                    'debug_data' => [
                        'clerk_id' => $request->clerk_id,
                        'full_name' => $request->full_name,
                        'email' => $request->email,
                        'has_image' => $request->hasFile('image'),
                        'image_size' => $request->hasFile('image') ? $request->file('image')->getSize() : null,
                    ]
                ], 422);
            }

            // Buscar usuario existente por clerk_id o email para no violar la restricción unique de email
            $user = User::where('clerk_id', $request->clerk_id)
                ->orWhere('email', $request->email)
                ->first();

            if (!$user) {
                $user = new User();
            }

            $user->clerk_id = $request->clerk_id;
            $user->full_name = $request->full_name;
            $user->email = $request->email;

            if ($request->filled('profession')) {
                $user->profession = $request->profession;
            }

            if ($request->filled('bio')) {
                $user->bio = $request->bio;
            }

            if ($request->filled('phone')) {
                $user->phone = $request->phone;
            }

            if ($request->filled('city')) {
                $user->city = $request->city;
            }

            $user->role = $request->role ?? $user->role ?? 'user';
            $user->save();

            // Guardar URL remota de imagen si se recibe
            if ($request->filled('imagen_profile')) {
                $user->imagen_profile = $request->input('imagen_profile');
                $user->save();
            } elseif ($request->hasFile('image')) {
                $file = $request->file('image');

                try {
                    // Crear ID público único
                    $publicId = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $user->full_name)) . '_' . time();

                    // Subir a Cloudinary
                    $cloudinaryService = new CloudinaryService();
                    $uploadResult = $cloudinaryService->upload($file, $publicId);

                    if (!isset($uploadResult['success']) || !$uploadResult['success']) {
                        \Log::warning('Cloudinary falló, usando fallback local: ' . ($uploadResult['error'] ?? 'Fallo en la subida a Cloudinary'));

                        $localUrl = $this->saveLocalImage($file, $publicId);
                        $user->imagen_profile = $localUrl;
                        $user->save();
                    } else {
                        $user->imagen_profile = $uploadResult['url'];
                        $user->save();
                    }
                } catch (\Exception $e) {
                    \Log::error('Upload Error: ' . $e->getMessage());

                    return response()->json([
                        'success' => false,
                        'message' => 'Error al subir imagen',
                        'error' => $e->getMessage(),
                    ], 500);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Usuario sincronizado correctamente',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            \Log::error('Sync Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    private function saveLocalImage(UploadedFile $file, string $publicId): string
    {
        $folder = public_path('profile_images');
        if (!is_dir($folder)) {
            mkdir($folder, 0755, true);
        }

        $extension = $file->getClientOriginalExtension() ?: 'png';
        $filename = $publicId . '.' . $extension;
        $file->move($folder, $filename);

        return asset('profile_images/' . $filename);
    }

}