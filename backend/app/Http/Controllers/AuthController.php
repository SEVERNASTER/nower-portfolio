<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\PasswordGeneratorService;
use Illuminate\Support\Facades\Mail;
use App\Mail\GeneratedPasswordMail;

class AuthController extends Controller
{
    public function assignPassword(
        Request $request,
        PasswordGeneratorService $passwordService
    ) {

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Generar contraseña segura
        $plainPassword = $passwordService->generate();

        // Hash seguro (BCrypt/Argon2)
        $user->password = Hash::make($plainPassword);

        // Forzar cambio de contraseña
        $user->must_change_password = true;

        $user->save();
        Mail::to($user->email)
            ->send(new GeneratedPasswordMail(
                $user,
                $plainPassword
            ));

        return response()->json([
            'message' => 'Password assigned successfully',
        ]);
    }
}
