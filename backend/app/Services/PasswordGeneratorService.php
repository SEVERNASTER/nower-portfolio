<?php

namespace App\Services;

class PasswordGeneratorService
{
    public function generate(int $length = 12): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $specials = '!@#$%^&*()_-+=<>?';

        $allCharacters = $uppercase . $lowercase . $numbers . $specials;

        // Garantiza al menos un carácter de cada tipo
        $password = [
            $uppercase[random_int(0, strlen($uppercase) - 1)],
            $lowercase[random_int(0, strlen($lowercase) - 1)],
            $numbers[random_int(0, strlen($numbers) - 1)],
            $specials[random_int(0, strlen($specials) - 1)],
        ];

        // Completar longitud restante
        for ($i = 4; $i < $length; $i++) {
            $password[] = $allCharacters[random_int(0, strlen($allCharacters) - 1)];
        }

        // Mezclar caracteres
        shuffle($password);

        return implode('', $password);
    }
}