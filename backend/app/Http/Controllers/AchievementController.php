<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AchievementController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        if ($user->role === 'admin') {
            $achievements = Achievement::with(['user', 'files'])->orderBy('created_at', 'desc')->get();
        } else {
            $achievements = Achievement::with(['user', 'files'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($achievements);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'institution' => 'required|string|max:150',
            'obtained_at' => 'required|date',
            'description' => 'nullable|string|max:1000',
            'evidence' => 'nullable|array',
            'evidence.*' => 'file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        try {
            $achievement = DB::transaction(function () use ($request, $user, $validated) {
                $achievement = Achievement::create([
                    'user_id' => $user->id,
                    'title' => $validated['title'],
                    'institution' => $validated['institution'],
                    'obtained_at' => $validated['obtained_at'],
                    'description' => $validated['description'],
                    'file_url' => null,
                    'file_public_id' => null,
                ]);

                $this->uploadEvidenceFiles($request, $achievement, $user);

                return $achievement;
            });
        } catch (\Exception $e) {
            Log::error('Achievement store failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al subir la evidencia a Cloudinary. '
                    . 'Verifica las variables CLOUDINARY_* en tu .env',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logro registrado correctamente',
            'achievement' => $achievement->load(['user', 'files'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $achievement = Achievement::with(['user', 'files'])->find($id);

        if (! $achievement) {
            return response()->json(['error' => 'Logro no encontrado'], 404);
        }

        return response()->json($achievement);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return $this->show($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'institution' => 'required|string|max:150',
            'obtained_at' => 'required|date',
            'description' => 'nullable|string|max:1000',
            'evidence' => 'nullable|array',
            'evidence.*' => 'file|mimes:jpg,jpeg,png,pdf|max:5120',
            'remove_file_ids' => 'nullable|array',
            'remove_file_ids.*' => 'integer|exists:achievement_files,id',
        ]);

        $achievement = Achievement::with('files')->find($id);
        if (! $achievement) {
            return response()->json(['error' => 'Logro no encontrado'], 404);
        }

        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (! $user || $achievement->user_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso para editar este logro'], 403);
        }

        try {
            DB::transaction(function () use ($request, $achievement, $user, $validated) {
                $achievement->update([
                    'title' => $validated['title'],
                    'institution' => $validated['institution'],
                    'obtained_at' => $validated['obtained_at'],
                    'description' => $validated['description'],
                ]);

                if (! empty($validated['remove_file_ids'])) {
                    $filesToRemove = $achievement->files()->whereIn('id', $validated['remove_file_ids'])->get();
                    foreach ($filesToRemove as $file) {
                        if ($file->public_id) {
                            $this->cloudinaryService->delete($file->public_id);
                        }
                        $file->delete();
                    }
                }

                $this->uploadEvidenceFiles($request, $achievement, $user);
            });
        } catch (\Exception $e) {
            Log::error('Achievement update failed', [
                'achievement_id' => $achievement->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al subir la evidencia a Cloudinary. '
                    . 'Verifica las variables CLOUDINARY_* en tu .env',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logro actualizado correctamente',
            'achievement' => $achievement->fresh()->load(['user', 'files'])
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (! $user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $achievement = Achievement::with('files')->find($id);
        if (! $achievement) {
            return response()->json(['error' => 'Logro no encontrado'], 404);
        }

        if ($achievement->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'No tienes permiso para eliminar este logro'], 403);
        }

        try {
            foreach ($achievement->files as $file) {
                if ($file->public_id) {
                    try {
                        $this->cloudinaryService->delete($file->public_id);
                    } catch (\Throwable $e) {
                        \Log::error('Cloudinary delete fallo para achievement file: ' . $e->getMessage());
                    }
                }
                $file->delete();
            }

            if ($achievement->file_public_id) {
                try {
                    $this->cloudinaryService->delete($achievement->file_public_id);
                } catch (\Throwable $e) {
                    \Log::error('Cloudinary delete fallo para logro legacy file: ' . $e->getMessage());
                }
            }

            $achievement->delete();
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error eliminando logro: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logro eliminado correctamente',
        ], 200);
    }

    /**
     * Sube archivos de evidencia a Cloudinary (mismo servicio y credenciales que el perfil).
     */
    private function uploadEvidenceFiles(Request $request, Achievement $achievement, $user): void
    {
        if (! $request->hasFile('evidence')) {
            return;
        }

        foreach ($request->file('evidence') as $index => $file) {
            if (! $file || ! $file->isValid()) {
                continue;
            }

            $publicId = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $user->full_name ?? 'USER'))
                . '_ACH_' . $user->id . '_' . time() . '_' . $index;

            // Mismas credenciales CLOUDINARY_* que el perfil; carpeta distinta, sin recorte facial.
            $result = $this->cloudinaryService->upload($file, $publicId, 'achievements');

            $achievement->files()->create([
                'url' => $result['url'] ?? '',
                'public_id' => $result['public_id'] ?? null,
                'mime_type' => $file->getClientMimeType(),
            ]);
        }
    }
}
