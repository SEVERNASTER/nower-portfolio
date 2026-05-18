<?php

namespace App\Services;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class PortfolioService
{
    /**
     * Get or create the user's portfolio.
     */
    public function getPortfolioForUser(User $user): Portfolio
    {
        return $user->portfolio()->firstOrCreate(
            ['user_id' => $user->id],
            ['status' => 'draft', 'is_public' => false]
        );
    }

    /**
     * Publish the user's portfolio.
     */
    public function publish(User $user): Portfolio
    {
        try {
            $portfolio = $this->getPortfolioForUser($user);
            
            // Domain rule: Prevent unneeded updates if already published
            if ($portfolio->status === 'published' && $portfolio->is_public === true) {
                return $portfolio;
            }

            $portfolio->update([
                'status' => 'published',
                'is_public' => true,
            ]);

            return $portfolio;
        } catch (\Exception $e) {
            Log::error("Failed to publish portfolio for user {$user->id}: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Unpublish the user's portfolio.
     */
    public function unpublish(User $user): Portfolio
    {
        try {
            $portfolio = $this->getPortfolioForUser($user);

            // Domain rule: Prevent unneeded updates if already unpublished
            if ($portfolio->status === 'draft' && $portfolio->is_public === false) {
                return $portfolio;
            }

            $portfolio->update([
                'status' => 'draft',
                'is_public' => false,
            ]);

            return $portfolio;
        } catch (\Exception $e) {
            Log::error("Failed to unpublish portfolio for user {$user->id}: {$e->getMessage()}");
            throw $e;
        }
    }
}
