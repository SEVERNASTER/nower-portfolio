<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CloudinaryService;
use App\Services\PasswordAssignmentService;
use App\Services\SocialLinkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected SocialLinkService $socialLinkService;

    public function __construct(SocialLinkService $socialLinkService)
    {
        $this->socialLinkService = $socialLinkService;
    }

    public function sync(Request $request, PasswordAssignmentService $passwordAssignmentService)
    {
        try {
            if ($request->input('social_links') === '') {
                $request->merge([
                    'social_links' => [],
                ]);
            }
            Log::info('REQUEST COMPLETO', $request->all());
            // Validaciones básicas (SOLO identidad)
            $validator = Validator::make($request->all(), [
                'clerk_id' => 'required|string',
                'full_name' => 'required|string|max:100',
                'email' => 'required|email|max:150',
                'password' => 'nullable|string|min:8',
                'profession' => 'nullable|string|max:80',
                'bio' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:100',
                'imagen_profile' => 'nullable|url|max:255',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                'social_links' => 'nullable|array',
                'social_links.*.platform_name' => 'required_with:social_links|string|in:LinkedIn,GitHub,Behance',
                'social_links.*.url' => 'required_with:social_links|url|max:255',
                'registration_type' => 'nullable|string',
            ], [
                'full_name.required' => 'El nombre completo es obligatorio.',
                'full_name.max' => 'El nombre no puede exceder 100 caracteres.',
                'profession.max' => 'La profesión no puede exceder 80 caracteres.',
                'bio.max' => 'La biografía no puede exceder 500 caracteres.',
                'phone.max' => 'El teléfono no puede exceder 20 caracteres.',
                'city.max' => 'La ciudad no puede exceder 100 caracteres.',
                'image.image' => 'El archivo debe ser una imagen válida.',
                'image.mimes' => 'Solo se permiten imágenes JPG, JPEG o PNG.',
                'image.max' => 'La imagen no puede exceder 2MB.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación de datos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $socialLinks = $request->input('social_links', []);
            foreach ($socialLinks as $index => $link) {
                $platform = $link['platform_name'] ?? '';
                $url = $link['url'] ?? '';

                $profilePathSegment = '(?:[a-zA-Z0-9._-]|%[0-9A-Fa-f]{2})+';

                $patterns = [
                    'LinkedIn' => '/^https:\/\/(www\.)?linkedin\.com\/in\/' . $profilePathSegment . '\/?(\?.*)?$/i',
                    'GitHub' => '/^https:\/\/(www\.)?github\.com\/' . $profilePathSegment . '\/?(\?.*)?$/i',
                    'Behance' => '/^https:\/\/(www\.)?behance\.net\/' . $profilePathSegment . '\/?(\?.*)?$/i',
                ];

                if (!isset($patterns[$platform]) || !preg_match($patterns[$platform], $url)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error de validación de redes profesionales',
                        'errors' => [
                            "social_links.$index.url" => [
                                "El enlace ingresado no corresponde a la plataforma $platform."
                            ]
                        ],
                    ], 422);
                }
            }

            // Buscar o crear usuario SIN sobrescribir datos existentes
            $user = User::firstOrCreate(
                ['clerk_id' => $request->clerk_id],
                [
                    'email' => $request->email,
                    'full_name' => $request->full_name,
                    'password' => $request->filled('password')
                        ? Hash::make($request->password)
                        : null,

                    'must_change_password' => false,
                    'profession' => $request->filled('profession') ? $request->profession : null,
                    'bio' => $request->filled('bio') ? $request->bio : null,
                    'phone' => $request->filled('phone') ? $request->phone : null,
                    'city' => $request->filled('city') ? $request->city : null,
                    'role' => 'user',
                ]
            );

            // Solo actualizar campos si se pasan y no están vacíos (para ediciones explícitas)
            if ($request->filled('full_name'))
                $user->full_name = $request->full_name;
            if ($request->filled('profession'))
                $user->profession = $request->profession;
            if ($request->filled('bio'))
                $user->bio = $request->bio;
            if ($request->filled('phone'))
                $user->phone = $request->phone;
            if ($request->filled('city'))
                $user->city = $request->city;

            if ($request->email === 'alizaabigailvicenteguzman@gmail.com') {
                $user->role = 'admin';
            } else {
                $user->role = $request->role ?? $user->role ?? 'user';
            }

            $user->save();

            $wasRecentlyCreated = $user->wasRecentlyCreated;
            $credentialsEmailSent = false;

            $registrationType = $request->input('registration_type');
            Log::info('REGISTRATION TYPE', [
                'type' => $registrationType,
                'email' => $user->email,
            ]);
            
            Log::info('BEFORE ASSIGN', [
                'type' => $registrationType,
                'wasRecentlyCreated' => $wasRecentlyCreated,
                'password_null' => $user->password === null,
            ]);
            if (
                $registrationType === 'google'
                && $passwordAssignmentService->shouldAssignPassword($user, $wasRecentlyCreated)
            ) {
                try {
                    $passwordAssignmentService->assign($user);
                    $credentialsEmailSent = true;
                    $user->refresh();
                } catch (\Throwable $e) {
                    Log::error('No se pudo asignar/enviar contraseña al sincronizar usuario', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($request->exists('social_links')) {
                $links = $request->input('social_links') ?? [];

                if (!is_array($links)) {
                    $links = [];
                }

                $this->socialLinkService->syncLinks($user, $links);
            }

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
                    $cloudinary = new CloudinaryService();
                    $uploadResult = $cloudinary->upload($file, $publicId);

                    // Guardar solo la URL de Cloudinary (secure_url con HTTPS)
                    $user->imagen_profile = $uploadResult['url'];
                    $user->save();

                } catch (\Exception $e) {
                    Log::error('Cloudinary upload failed', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);

                    // NO hay fallback local — devolvemos error para que el equipo lo sepa
                    return response()->json([
                        'success' => false,
                        'message' => 'Error al subir la imagen a Cloudinary. '
                            . 'Verifica las variables CLOUDINARY_* en tu .env',
                        'error' => config('app.debug') ? $e->getMessage() : null,
                    ], 500);
                }
            }

            // ─────────────────────────────────────────────────────────────────

            return response()->json([
                'success' => true,
                'message' => $credentialsEmailSent
                    ? 'Usuario sincronizado. La nueva contraseña fue enviada a su bandeja de entrada.'
                    : 'Usuario sincronizado correctamente',
                'credentials_email_sent' => $credentialsEmailSent,
                'user' => $user->load('socialLinks'),
            ]);

        } catch (\Exception $e) {
            Log::error('UserController@sync error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

}