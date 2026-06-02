<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\ClerkAuth;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminPortfolioReviewController;

// PUBLIC route. Anyone can see it.
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'message' => 'El backend está funcionando']);
});

// Explore Portfolios (Public Route)
Route::get('/explore/portfolios', [ExploreController::class, 'index']);
Route::get('/public/portfolios/{slug}', [PortfolioController::class, 'showPublic']);

// Login con email/contraseña (validación local + token Clerk)
Route::post('/auth/login', [AuthController::class, 'login']);

// PROTECTED routes. MUST have a Clerk token to enter.
Route::post('/sync-user', [UserController::class, 'sync']);

Route::get('/profile', [ProfileController::class, 'getProfile']);
Route::put('/profile', [ProfileController::class, 'updateProfile']);
Route::put('/profile/contact', [ContactController::class, 'updateContact']);

Route::middleware([ClerkAuth::class])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
});

Route::middleware([ClerkAuth::class, \App\Http\Middleware\EnsurePasswordChanged::class])->group(function () {

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

    // Experience CRUD (laboral + legado; el frontend laboral usa type work)
    Route::apiResource('experience', ExperienceController::class)->only([
        'index', 'store', 'show', 'update', 'destroy',
    ]);

    // Achievements CRUD
    Route::apiResource('achievements', AchievementController::class)->only([
        'index', 'store', 'show', 'update', 'destroy',
    ]);

    Route::get('education', [ExperienceController::class, 'educationIndex']);
    Route::post('education', [ExperienceController::class, 'educationStore']);
    Route::put('education/{id}', [ExperienceController::class, 'educationUpdate']);
    Route::delete('education/{id}', [ExperienceController::class, 'educationDestroy']);

    // Portfolio Publish/Unpublish
    Route::get('/portfolio/status', [PortfolioController::class, 'status']);
    Route::get('/portfolio/preview', [PortfolioController::class, 'preview']);
    Route::post('/portfolio/publish', [PortfolioController::class, 'publish']);
    Route::post('/portfolio/unpublish', [PortfolioController::class, 'unpublish']);
});

// ADMIN routes. MUST have Clerk token AND Admin role to enter.
Route::middleware([
    ClerkAuth::class,
    \App\Http\Middleware\EnsurePasswordChanged::class,
    \App\Http\Middleware\AdminAuth::class,
])->group(function () {

    Route::get('/admin/users-data', [AdminDashboardController::class, 'getUsersData']);    
    // Endpoint para frontend de verificación si el AdminAuth es exitoso
    Route::get('/admin/validate', function (Request $request) {
        $user = $request->attributes->get('auth_user');
        return response()->json([
            'message' => 'Validación de administrador exitosa',
            'user' => $user
        ]);
    });

    // Aquí irían el resto de rutas de moderación y reportes...

    Route::post('/auth/assign-password', [AuthController::class, 'assignPassword']);
    Route::post(
        '/admin/portfolio/review',
        [AdminPortfolioReviewController::class, 'review']
    );
});
