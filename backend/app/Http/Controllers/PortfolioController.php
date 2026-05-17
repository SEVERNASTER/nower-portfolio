<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PortfolioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PortfolioController extends Controller
{
    public function __construct(
        private readonly PortfolioService $portfolioService,
    ) {}

    /**
     * GET /api/portfolio/status
     *
     * Fetch the current visibility status of the authenticated user's portfolio.
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = $this->resolveUser($request);
            $portfolio = $this->portfolioService->getPortfolioForUser($user);

            return response()->json([
                'data' => [
                    'id' => $portfolio->id,
                    'status' => $portfolio->status,
                    'is_public' => $portfolio->is_public,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching portfolio status: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el estado del portafolio.'
            ], 500);
        }
    }

    /**
     * POST /api/portfolio/publish
     *
     * Publish the authenticated user's portfolio.
     */
    public function publish(Request $request): JsonResponse
    {
        try {
            $user = $this->resolveUser($request);
            $portfolio = $this->portfolioService->publish($user);

            return response()->json([
                'message' => 'Portafolio publicado exitosamente.',
                'data' => [
                    'status' => $portfolio->status,
                    'is_public' => $portfolio->is_public,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error publishing portfolio: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al publicar el portafolio.'
            ], 500);
        }
    }

    /**
     * POST /api/portfolio/unpublish
     *
     * Unpublish the authenticated user's portfolio.
     */
    public function unpublish(Request $request): JsonResponse
    {
        try {
            $user = $this->resolveUser($request);
            $portfolio = $this->portfolioService->unpublish($user);

            return response()->json([
                'message' => 'Portafolio despublicado exitosamente.',
                'data' => [
                    'status' => $portfolio->status,
                    'is_public' => $portfolio->is_public,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error unpublishing portfolio: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al despublicar el portafolio.'
            ], 500);
        }
    }

    /**
     * Resolve the authenticated User model from the Clerk ID
     * injected by the ClerkAuth middleware.
     */
    private function resolveUser(Request $request): User
    {
        $clerkId = $request->attributes->get('clerk_user_id');

        return User::firstOrCreate(
            ['clerk_id' => $clerkId],
            [
                'full_name' => 'New User',
                'email'     => $clerkId . '@placeholder.com',
            ]
        );
    }
}
