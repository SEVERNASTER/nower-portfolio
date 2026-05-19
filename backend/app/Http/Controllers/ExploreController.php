<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExplorePortfolioRequest;
use App\Services\ExploreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ExploreController extends Controller
{
    public function __construct(
        private readonly ExploreService $exploreService,
    ) {}

    /**
     * GET /api/explore/portfolios
     *
     * Public endpoint to explore, filter, and paginate published portfolios.
     */
    public function index(ExplorePortfolioRequest $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'city', 'skills', 'tags']);
            $perPage = $request->input('per_page', 15);

            $paginator = $this->exploreService->getFilteredPortfolios($filters, $perPage);

            return response()->json([
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("Error exploring portfolios: " . $e->getMessage());
            return response()->json([
                'message' => 'Ocurrió un error al cargar los portafolios.',
            ], 500);
        }
    }
}
