<?php

namespace App\Services;

use App\Mail\GeneratedPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PasswordAssignmentService
{
    public function __construct(
        protected PasswordGeneratorService $passwordGenerator,
        protected ClerkService $clerkService
    ) {
    }

    /**
     * Genera contraseña, la guarda, sincroniza Clerk y envía correo.
     * No devuelve la contraseña en texto plano (uso interno vía logs si MAIL_MAILER=log).
     */
    public function assign(User $user): void
    {
        Log::info('ENTRO A ASSIGN PASSWORD', [
                'email' => $user->email,
            ]);
        if ($user->role === 'admin') {
            throw new \RuntimeException('No se puede asignar contraseña temporal a usuarios administradores.');
        }

        $plainPassword = $this->passwordGenerator->generate();

        $user->password = Hash::make($plainPassword);
        $user->must_change_password = true;
        $user->save();

        try {
            $this->clerkService->updatePassword($user->clerk_id, $plainPassword);
        } catch (\Throwable $e) {
            Log::error('PasswordAssignment: fallo sync Clerk', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $this->sendCredentialsEmail($user, $plainPassword);
        Log::info('ASSIGN PASSWORD EJECUTADO', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    public function sendCredentialsEmail(User $user, string $plainPassword): void
    {
        if (config('mail.default') === 'log') {
            Log::info('MAIL_MAILER=log: el correo no se envía al buzón. Configura SMTP en .env. Contraseña generada para depuración.', [
                'email' => $user->email,
                'password' => $plainPassword,
            ]);
        }

        try {
            Mail::to($user->email)->send(new GeneratedPasswordMail($user, $plainPassword));
        } catch (\Throwable $e) {
            Log::error('PasswordAssignment: fallo envío de correo', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException(
                'No se pudo enviar el correo con las credenciales. Revisa MAIL_* en .env: ' . $e->getMessage()
            );
        }
    }

    public function shouldAssignPassword(User $user, bool $wasRecentlyCreated): bool
    {
        if ($user->role === 'admin') {
            return false;
        }

        Log::info('SHOULD ASSIGN', [
            'email' => $user->email,
            'password_null' => $user->password === null,
            'wasRecentlyCreated' => $wasRecentlyCreated,
        ]);

        return $wasRecentlyCreated || $user->password === null;
    }
}
