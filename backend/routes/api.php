<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\ClerkAuth;

// PUBLIC route. Anyone can see it.
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'El backend está funcionando']);
});

// PROTECTED route. MUST have a Clerk token to enter.
Route::middleware([ClerkAuth::class])->group(function () {

    Route::get('/perfil', function (Request $request) {
        $clerkId = $request->attributes->get('clerk_user_id');

        return response()->json([
            'message' => '¡Has pasado la seguridad del backend!',
            'tu_id_de_clerk' => $clerkId
        ]);
    });

});