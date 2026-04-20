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
            throw new \Exception(
                'Credenciales de Cloudinary no configuradas. ' .
                'Asegúrate de definir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu .env'
            );
        }

        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ],
            'url' => [
                'secure' => true,   // siempre HTTPS
            ],
        ]);
    }

    /**
     * Sube un archivo a Cloudinary directamente desde su ruta temporal.
     * NO guarda ningún archivo en disco local.
     *
     * @param  UploadedFile  $file      Archivo recibido por el endpoint
     * @param  string        $publicId  Identificador público en Cloudinary
     * @param  string        $folder    Carpeta dentro de Cloudinary
     * @return array{success: bool, url?: string, public_id?: string, error?: string}
     */
    public function upload(UploadedFile $file, string $publicId, string $folder = 'profile_images'): array
    {
        $realPath = $file->getRealPath();

        if (!$realPath || !file_exists($realPath)) {
            throw new \Exception('El archivo temporal no existe o no es legible.');
        }

        // El SDK de Cloudinary PHP sube directamente desde la ruta temporal del servidor.
        $uploadOptions = [
            'folder'        => $folder,
            'public_id'     => $publicId,
            'overwrite'     => true,
            'resource_type' => 'image',
            // Transformaciones opcionales al subir
            'transformation' => [
                ['width' => 400, 'height' => 400, 'crop' => 'fill', 'gravity' => 'face'],
            ],
        ];

        if ($uploadPreset = config('cloudinary.upload_preset')) {
            $uploadOptions['upload_preset'] = $uploadPreset;
        }

        $result = $this->cloudinary->uploadApi()->upload($realPath, $uploadOptions);

        if (empty($result['secure_url'])) {
            throw new \Exception('Cloudinary no devolvió una URL segura.');
        }

        return [
            'success'   => true,
            'url'       => $result['secure_url'],
            'public_id' => $result['public_id'] ?? "{$folder}/{$publicId}",
        ];
    }
}