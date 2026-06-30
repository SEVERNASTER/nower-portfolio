<?php

namespace App\Services;

use App\Models\Portfolio;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class ExploreService
{
    public function __construct(
        private readonly PortfolioService $portfolioService,
    ) {
    }

    /**
     * Get paginated and filtered public portfolios.
     */
    public function getFilteredPortfolios(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $portfolios = Portfolio::query()
            ->where('is_public', true)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->filter(fn(Portfolio $portfolio) => $this->portfolioService->hasPublicVersion($portfolio))
            ->map(function (Portfolio $portfolio) {
                $portfolio->setAttribute(
                    'user',
                    $this->portfolioService->publicUserPayload($portfolio)
                );

                return $portfolio;
            })
            ->filter(fn(Portfolio $portfolio) => $this->matchesFilters($portfolio->user, $filters))
            ->values();

        $page = Paginator::resolveCurrentPage();
        $items = $portfolios->slice(($page - 1) * $perPage, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $portfolios->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
    }

    private function matchesFilters(array $user, array $filters): bool
    {
        if (!empty($filters['search'])) {
            $search = mb_strtolower($filters['search']);
            $haystack = mb_strtolower(implode(' ', [
                $user['full_name'] ?? '',
                $user['profession'] ?? '',
                $user['bio'] ?? '',
                $user['city'] ?? '',
                $user['skills'] ?? [],
                $user['projects'] ?? [],
            ]));

            if (!str_contains($haystack, $search)) {
                return false;
            }
        }

        if (!empty($filters['city'])) {
            $city = mb_strtolower($user->city ?? '');

            if (!str_contains($city, mb_strtolower($filters['city']))) {
                return false;
            }
        }

        if (!empty($filters['skills'])) {
            $skills = collect($user['skills'] ?? [])
                ->pluck('name')
                ->filter()
                ->all();

            if (empty(array_intersect($filters['skills'], $skills))) {
                return false;
            }
        }

        if (!empty($filters['tags'])) {
            $tags = collect($user->projects ?? [])
                ->flatMap(fn($project) => $project['tags'] ?? [])
                ->filter()
                ->all();

            if (empty(array_intersect($filters['tags'], $tags))) {
                return false;
            }
        }

        return true;
    }
}
