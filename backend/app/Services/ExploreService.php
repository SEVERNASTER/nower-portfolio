<?php

namespace App\Services;

use App\Models\Portfolio;
use Illuminate\Pagination\LengthAwarePaginator;

class ExploreService
{
    /**
     * Get paginated and filtered public portfolios.
     */
    public function getFilteredPortfolios(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Portfolio::query()
            ->with([
                'user:id,full_name,profession,city,imagen_profile,bio',
                'user.skills:id,user_id,name,type',
                'user.projects:id,user_id,title,tags',
            ])
            ->where('status', 'published')
            ->where('is_public', true);

        // Filter by user attributes (search, city)
        if (!empty($filters['search']) || !empty($filters['city'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                if (!empty($filters['search'])) {
                    $searchTerm = '%' . $filters['search'] . '%';
                    $q->where(function ($subQ) use ($searchTerm) {
                        $subQ->where('full_name', 'ILIKE', $searchTerm)
                             ->orWhere('profession', 'ILIKE', $searchTerm)
                             ->orWhere('bio', 'ILIKE', $searchTerm);
                    });
                }

                if (!empty($filters['city'])) {
                    $q->where('city', 'ILIKE', '%' . $filters['city'] . '%');
                }
            });
        }

        // Filter by skills (OR logic within skills)
        if (!empty($filters['skills'])) {
            $query->whereHas('user.skills', function ($q) use ($filters) {
                $q->whereIn('name', $filters['skills']);
            });
        }

        // Filter by project tags (OR logic within tags using jsonb capabilities)
        if (!empty($filters['tags'])) {
            $query->whereHas('user.projects', function ($q) use ($filters) {
                $q->where(function ($subQ) use ($filters) {
                    foreach ($filters['tags'] as $tag) {
                        $subQ->orWhereJsonContains('tags', $tag);
                    }
                });
            });
        }

        return $query->orderBy('updated_at', 'desc')->paginate($perPage);
    }
}
