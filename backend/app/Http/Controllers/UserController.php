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
            // Validaciones
            $validator = Validator::make($request->all(), [
                'clerk_id' => 'required|string',
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:150',
                'profession' => 'nullable|string|max:80',
                'bio' => 'nullable|string|max:500',
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
            $user->profession = $request->profession ?? null;
            $user->bio = $request->bio ?? null;
            $user->role = $request->role ?? 'user';
            $user->save();

            // Procesar imagen si se envía
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                try {
                    // Crear ID público único
                    $publicId = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $user->full_name)) . '_' . time();

                    // Usar CloudinaryService
                    $cloudinaryService = new CloudinaryService();
                    $uploadResult = $cloudinaryService->upload($file, $publicId);

                    if ($uploadResult['success']) {
                        // Guardar URL en la base de datos
                        $user->imagen_profile = $uploadResult['url'];
                        $user->save();
                    } else {
                        // Fallback local: guardar archivo en public/profile_images
                        try {
                            $localUrl = $this->saveLocalImage($file, $publicId);
                            $user->imagen_profile = $localUrl;
                            $user->save();
                        } catch (\Exception $localException) {
                            \Log::error('Local image fallback failed: ' . $localException->getMessage());
                            return response()->json([
                                'success' => false,
                                'message' => 'Error al subir imagen',
                                'error' => $uploadResult['error'] ?? $localException->getMessage()
                            ], 500);
                        }
                    }
                    
                } catch (\Exception $e) {
                    \Log::error('Upload Error: ' . $e->getMessage());
                    try {
                        $localUrl = $this->saveLocalImage($file, $publicId);
                        $user->imagen_profile = $localUrl;
                        $user->save();
                    } catch (\Exception $localException) {
                        \Log::error('Local image fallback failed: ' . $localException->getMessage());
                        return response()->json([
                            'success' => false,
                            'message' => 'Error al subir imagen a Cloudinary',
                            'error' => $e->getMessage()
                        ], 500);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Perfil sincronizado correctamente',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Sync Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error interno en el servidor.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error 500'
            ], 500);
        }
    }

    private function saveLocalImage(UploadedFile $file, string $publicId): string
    {
        $storagePath = public_path('profile_images');
        if (!is_dir($storagePath) && !mkdir($storagePath, 0755, true) && !is_dir($storagePath)) {
            throw new \Exception('No se pudo crear el directorio de imágenes locales.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $filename = $publicId . '.' . ($extension ?: 'png');

        $file->move($storagePath, $filename);

        return asset('profile_images/' . $filename);
    }
}