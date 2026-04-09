<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\ClerkAuth;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;

// PUBLIC route. Anyone can see it.
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'El backend está funcionando']);
});

// PROTECTED routes. MUST have a Clerk token to enter.
Route::post('/sync-user', [UserController::class, 'sync']);

Route::get('/profile', [ProfileController::class, 'getProfile']);
Route::put('/profile', [ProfileController::class, 'updateProfile']);
Route::put('/profile/contact', [ContactController::class, 'updateContact']);

Route::middleware([ClerkAuth::class])->group(function () {

    Route::get('/perfil', function (Request $request) {
        $clerkId = $request->attributes->get('clerk_user_id');

        return response()->json([
            'message'        => '¡Has pasado la seguridad del backend!',
            'tu_id_de_clerk' => $clerkId
        ]);
    });

    // Skills CRUD
    Route::apiResource('skills', SkillController::class)->only([
        'index', 'store', 'update', 'destroy',
    ]);
});