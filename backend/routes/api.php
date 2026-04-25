<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\ClerkAuth;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AdminDashboardController;

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

    // Projects CRUD (Usuarios y Admin)
    Route::apiResource('projects', ProjectController::class)->only([
        'index', 'store', 'show', 'update', 'destroy',
    ]);
});

// ADMIN routes. MUST have Clerk token AND Admin role to enter.
Route::middleware([\App\Http\Middleware\ClerkAuth::class, \App\Http\Middleware\AdminAuth::class])->group(function () {

    Route::get('/admin/users-with-projects', [AdminDashboardController::class, 'getUsersWithProjects']);    
    // Endpoint para frontend de verificación si el AdminAuth es exitoso
    Route::get('/admin/validate', function (Request $request) {
        $user = $request->attributes->get('auth_user');
        return response()->json([
            'message' => 'Validación de administrador exitosa',
            'user' => $user
        ]);
    });

    // Aquí irían el resto de rutas de moderación y reportes...
});