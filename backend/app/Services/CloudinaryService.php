<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $cloudName = config('cloudinary.cloud_name');
        $apiKey = config('cloudinary.api_key');
        $apiSecret = config('cloudinary.api_secret');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new \Exception('Credenciales de Cloudinary no configuradas');
        }

        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ],
        ]);
    }

    /**
     * Subir archivo a Cloudinary y devolver URL segura.
     */
    public function upload(UploadedFile $file, string $publicId, string $folder = 'profile_images'): array
    {
        try {
            $path = $file->getRealPath();

            if (!$path || !file_exists($path)) {
                throw new \Exception('El archivo temporal no existe');
            }

            $uploadResult = $this->cloudinary->uploadApi()->upload($path, [
                'folder' => $folder,
                'public_id' => $publicId,
                'overwrite' => true,
                'resource_type' => 'image',
            ]);

            if (!isset($uploadResult['secure_url'])) {
                throw new \Exception('No se obtuvo URL segura de Cloudinary');
            }

            return [
                'success' => true,
                'url' => $uploadResult['secure_url'],
                'public_id' => $uploadResult['public_id'] ?? $publicId,
            ];
        } catch (\Exception $e) {
            \Log::error('Cloudinary Upload Error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
