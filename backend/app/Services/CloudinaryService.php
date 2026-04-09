<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private $cloudinary;
    private $cloudName;
    private $apiKey;
    private $apiSecret;

    public function __construct()
    {
        $this->cloudName = env('CLOUDINARY_CLOUD_NAME');
        $this->apiKey = env('CLOUDINARY_API_KEY');
        $this->apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$this->cloudName || !$this->apiKey || !$this->apiSecret) {
            throw new \Exception('Credenciales de Cloudinary no configuradas');
        }

        // Crear instancia de Cloudinary
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $this->cloudName,
                'api_key' => $this->apiKey,
                'api_secret' => $this->apiSecret,
            ]
        ]);
    }

    /**
     * Subir archivo a Cloudinary
     */
    public function upload(UploadedFile $file, string $publicId, string $folder = 'profile_images'): array
    {
        try {
            // Obtener la ruta temporal del archivo
            $tempPath = $file->getRealPath();

            if (!file_exists($tempPath)) {
                throw new \Exception('El archivo temporal no existe');
            }

            // Intentar subida con Cloudinary (sin verificación SSL)
            $uploadResult = $this->cloudinary->uploadApi()->upload(
                $tempPath,
                [
                    'folder' => $folder,
                    'public_id' => $publicId,
                    'overwrite' => true,
                    'resource_type' => 'image',
                ]
            );

            // Validar respuesta
            if (!isset($uploadResult['secure_url'])) {
                throw new \Exception('No se obtuvo URL de la imagen');
            }

            return [
                'success' => true,
                'url' => $uploadResult['secure_url'],
                'public_id' => $uploadResult['public_id'],
            ];

        } catch (\Exception $e) {
            \Log::error('Cloudinary Upload Error: ' . $e->getMessage());
            
            // Reintentar con método alternativo si falla SSL
            return $this->uploadWithCurl($file, $publicId, $folder);
        }
    }

    /**
     * Método alternativo usando cURL directo
     */
    private function uploadWithCurl(UploadedFile $file, string $publicId, string $folder): array
    {
        $uploadUrl = "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload";
        
        $ch = curl_init();
        
        // Configurar cURL
        curl_setopt_array($ch, [
            CURLOPT_URL => $uploadUrl,
            CURLOPT_POST => 1,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => false,  // Deshabilitar verificación SSL
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_FRESH_CONNECT => true,
            CURLOPT_FORBID_REUSE => true,
        ]);

        // Preparar datos
        $timestamp = time();
        $paramsToSign = [
            'folder' => $folder,
            'overwrite' => 'true',
            'public_id' => $publicId,
            'resource_type' => 'image',
            'timestamp' => $timestamp,
        ];

        ksort($paramsToSign);
        $signatureString = http_build_query($paramsToSign, '', '&', PHP_QUERY_RFC3986);
        $signature = sha1($signatureString . $this->apiSecret);

        $postData = [
            'file' => new \CURLFile($file->getRealPath()),
            'public_id' => $publicId,
            'folder' => $folder,
            'api_key' => $this->apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'overwrite' => 'true',
            'resource_type' => 'image',
        ];

        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        
        curl_close($ch);

        if ($curlError) {
            throw new \Exception('cURL Error: ' . $curlError);
        }

        $result = json_decode($response, true);

        if ($httpCode != 200 || !isset($result['secure_url'])) {
            $errorMsg = $result['error']['message'] ?? 'Error desconocido';
            throw new \Exception("Cloudinary Error (HTTP {$httpCode}): {$errorMsg}");
        }

        return [
            'success' => true,
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }
}
