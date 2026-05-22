<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\PasswordAssignmentService;
use Illuminate\Console\Command;

class SendUserPasswordCommand extends Command
{
    protected $signature = 'password:send {email : Correo del usuario en la base de datos}';

    protected $description = 'Genera contraseña, la envía por correo y sincroniza Clerk para un usuario existente';

    public function handle(PasswordAssignmentService $passwordService): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (!$user) {
            $this->error('No se encontró un usuario con ese correo.');
            return self::FAILURE;
        }

        try {
            $passwordService->assign($user);
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }

        $this->info("Credenciales enviadas a {$user->email}.");

        if (config('mail.default') === 'log') {
            $this->warn('MAIL_MAILER=log: revisa storage/logs/laravel.log para ver la contraseña.');
        }

        return self::SUCCESS;
    }
}
