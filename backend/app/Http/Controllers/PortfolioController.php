<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use App\Services\PortfolioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

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
                'data' => $this->portfolioPayload($portfolio),
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching portfolio status: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el estado del portafolio.'
            ], 500);
        }
    }

     /**
     * GET /api/portfolio/preview
     *develve todos los datos necesarios para armar la vista previa
     */
    public function preview(Request $request): JsonResponse
    {
        try {
            $user = $this->resolveUser($request);

            $user->load([
                'socialLinks',
                'projects.links',
                'projects.images',
                'skills',
                'experiences',
                'achievements.files',
                'portfolio',
            ]);

            $portfolio = $this->portfolioService->getPortfolioForUser($user);

            return response()->json([
                'portfolio' => $this->portfolioPayload($portfolio),
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching portfolio preview: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al cargar la vista previa del portafolio.'
            ], 500);
        }
    }

    /**
     * POST /api/portfolio/publish
     *
     * envia el portafolio a revision, no lo publica directmente
     */
    public function publish(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_key' => [
                'required',
                Rule::in(PortfolioService::allowedTemplates()),
            ],
        ]);

        try {
            $user = $this->resolveUser($request);

            $portfolio = $this->portfolioService->publish(
                $user,
                $validated['template_key']
            );

            return response()->json([
                'message' => 'Tu portafolio fue enviado a revisión de los administradores.',
                'data' => $this->portfolioPayload($portfolio),
            ]);
        } catch (\Exception $e) {
            Log::error("Error sending portfolio to review: " . $e->getMessage());

            return response()->json([
                'message' => 'Error interno al enviar el portafolio a revisión.'
            ], 500);
        }
    }

    /**
     * POST /api/portfolio/unpublish
     */
    public function unpublish(Request $request): JsonResponse
    {
        try {
            $user = $this->resolveUser($request);
            $portfolio = $this->portfolioService->unpublish($user);

            return response()->json([
                'message' => 'Portafolio despublicado correctamente. Ya no está visible publicamente.',
                'data' => $this->portfolioPayload($portfolio),
            ]);
        } catch (\Exception $e) {
            Log::error("Error unpublishing portfolio: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al despublicar el portafolio.'
            ], 500);
        }
    }

     /**
     * GET /api/public/portfolios/{slug}
     *ruta para que visitantes vean el portafolio aprobado
     */
    public function showPublic(string $slug): JsonResponse
    {
        $portfolio = Portfolio::query()
            ->with([
                'user.socialLinks',
                'user.projects.links',
                'user.projects.images',
                'user.skills',
                'user.experiences',
                'user.achievements.files',
            ])
            ->where('public_slug', $slug)
            ->where('status', 'published')
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'portfolio' => $this->portfolioPayload($portfolio),
            'user' => $portfolio->user,
        ]);
    }

    private function portfolioPayload(Portfolio $portfolio): array
    {
        return [
            'id' => $portfolio->id,
            'status' => $portfolio->status,
            'is_public' => $portfolio->is_public,
            'review_status' => $portfolio->review_status,
            'review_comment' => $portfolio->review_comment,
            'reviewed_at' => $portfolio->reviewed_at,
            'template_key' => $portfolio->template_key ?? PortfolioService::TEMPLATE_CLASSIC,
            'public_slug' => $portfolio->public_slug,
            'public_url' => $portfolio->public_slug ? '/p/' . $portfolio->public_slug : null,
            'content_dirty' => $portfolio->content_dirty,
        ];
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
