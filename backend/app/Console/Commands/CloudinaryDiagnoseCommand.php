<?php

namespace App\Console\Commands;

use App\Services\CloudinaryService;
use Illuminate\Console\Command;

class CloudinaryDiagnoseCommand extends Command
{
    protected $signature = 'cloudinary:diagnose';

    protected $description = 'Diagnostica configuración y conexión de Cloudinary en el entorno actual';

    public function handle(CloudinaryService $cloudinaryService): int
    {
        $cloudName = trim((string) config('cloudinary.cloud_name'));
        $apiKey = preg_replace('/\s+/', '', (string) config('cloudinary.api_key'));
        $apiSecret = trim((string) config('cloudinary.api_secret'));
        $configCached = app()->configurationIsCached();

        $this->info('Diagnóstico Cloudinary');
        $this->line('APP_ENV: ' . app()->environment());
        $this->line('Config cache: ' . ($configCached ? 'SI' : 'NO'));
        $this->line('CLOUDINARY_CLOUD_NAME: ' . ($cloudName !== '' ? $cloudName : '(vacío)'));
        $this->line('CLOUDINARY_API_KEY: ' . $this->mask($apiKey));
        $this->line('CLOUDINARY_API_SECRET: ' . ($apiSecret !== '' ? 'definido' : '(vacío)'));
        $this->newLine();

        if ($cloudName === '' || $apiKey === '' || $apiSecret === '') {
            $this->error('Faltan variables CLOUDINARY_* en este entorno.');
            $this->warn('Revisa tu .env del servidor y ejecuta: php artisan optimize:clear');
            return self::FAILURE;
        }

        if (!preg_match('/^\d+$/', $apiKey)) {
            $this->error('CLOUDINARY_API_KEY tiene formato inválido. Solo debe contener números.');
            return self::FAILURE;
        }

        try {
            $response = $cloudinaryService->ping();
            $this->info('Conexión OK con Cloudinary.');

            if (isset($response['status'])) {
                $this->line('Cloudinary status: ' . $response['status']);
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Fallo de autenticación o conexión con Cloudinary.');
            $this->line($e->getMessage());
            $this->newLine();
            $this->warn('Checklist sugerido:');
            $this->line('1) Copiar claves exactas del Dashboard de Cloudinary.');
            $this->line('2) Verificar que correspondan al mismo cloud_name.');
            $this->line('3) Ejecutar: php artisan optimize:clear');
            $this->line('4) Reiniciar php-fpm/apache y volver a probar.');

            return self::FAILURE;
        }
    }

    private function mask(string $value): string
    {
        if ($value === '') {
            return '(vacío)';
        }

        if (strlen($value) <= 4) {
            return '****';
        }

        return str_repeat('*', max(strlen($value) - 4, 4)) . substr($value, -4);
    }
}
