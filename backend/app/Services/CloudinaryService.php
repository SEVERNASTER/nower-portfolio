<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Exception\AuthorizationRequired;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $cloudName = trim((string) config('cloudinary.cloud_name'));
        $apiKey = preg_replace('/\s+/', '', (string) config('cloudinary.api_key'));
        $apiSecret = trim((string) config('cloudinary.api_secret'));

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new \Exception(
                'Credenciales de Cloudinary no configuradas. ' .
                'Asegúrate de definir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu .env'
            );
        }

        if (!preg_match('/^\d+$/', $apiKey)) {
            throw new \Exception(
                'CLOUDINARY_API_KEY tiene un formato inválido. Solo debe contener números.'
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
        $isImage = str_starts_with($file->getClientMimeType(), 'image/');
        $uploadOptions = [
            'folder'        => $folder,
            'public_id'     => $publicId,
            'overwrite'     => true,
            'resource_type' => $isImage ? 'image' : 'auto',
        ];

        // Recorte facial solo para fotos de perfil (misma lógica que UserController::sync).
        if ($isImage && $folder === 'profile_images') {
            $uploadOptions['transformation'] = [
                ['width' => 400, 'height' => 400, 'crop' => 'fill', 'gravity' => 'face'],
            ];
        }

        if ($uploadPreset = config('cloudinary.upload_preset')) {
            $uploadOptions['upload_preset'] = $uploadPreset;
        }

        try {
            $result = $this->cloudinary->uploadApi()->upload($realPath, $uploadOptions);
        } catch (AuthorizationRequired $e) {
            $maskedKey = $this->maskApiKey((string) config('cloudinary.api_key'));

            throw new \Exception(
                "Cloudinary rechazó las credenciales (API key cargada: {$maskedKey}). " .
                'Verifica CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET y limpia caché con: php artisan optimize:clear',
                0,
                $e
            );
        }

        if (empty($result['secure_url'])) {
            throw new \Exception('Cloudinary no devolvió una URL segura.');
        }

        return [
            'success'   => true,
            'url'       => $result['secure_url'],
            'public_id' => $result['public_id'] ?? "{$folder}/{$publicId}",
        ];
    }

    public function delete(string $publicId): bool
    {
        try {
            $result = $this->cloudinary->uploadApi()->destroy($publicId, [
                'resource_type' => 'auto',
            ]);
        } catch (AuthorizationRequired $e) {
            throw new \Exception(
                'Cloudinary rechazó credenciales al eliminar recursos. Revisa CLOUDINARY_* y ejecuta php artisan optimize:clear',
                0,
                $e
            );
        }

        return isset($result['result']) && $result['result'] === 'ok';
    }

    /**
     * Verifica credenciales con un ping a Admin API.
     *
     * @return mixed
     */
    public function ping(): mixed
    {
        try {
            return $this->cloudinary->adminApi()->ping();
        } catch (AuthorizationRequired $e) {
            throw new \Exception(
                'Cloudinary ping falló por credenciales inválidas. Revisa CLOUDINARY_* y limpia caché con php artisan optimize:clear',
                0,
                $e
            );
        }
    }

    private function maskApiKey(string $apiKey): string
    {
        $clean = preg_replace('/\s+/', '', trim($apiKey));

        if (strlen($clean) <= 4) {
            return '****';
        }

        return str_repeat('*', max(strlen($clean) - 4, 4)) . substr($clean, -4);
    }
}