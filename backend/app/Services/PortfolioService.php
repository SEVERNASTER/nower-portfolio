<?php

namespace App\Services;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PortfolioService
{
    public const STATUS_UNPUBLISHED = 'unpublished';
    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_PUBLISHED = 'published';

    public const TEMPLATE_CLASSIC = 'classic';
    public const TEMPLATE_MODERN = 'modern';
    public const TEMPLATE_CREATIVE = 'creative';

    public static function allowedTemplates(): array
    {
        return [
            self::TEMPLATE_CLASSIC,
            self::TEMPLATE_MODERN,
            self::TEMPLATE_CREATIVE,
        ];
    }

    /**
     * Get or create the user's portfolio.
     */
    public function getPortfolioForUser(User $user): Portfolio
    {
        return $user->portfolio()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => self::STATUS_UNPUBLISHED,
                'is_public' => false,
                'review_status' => null,
                'review_comment' => null,
                'reviewed_at' => null,
                'template_key' => self::TEMPLATE_CLASSIC,
                'public_slug' => $this->generateUniqueSlug($user),
            ]
        );
    }

    /**
     * envia el portafolio a revision del admin,no se publica directamente
     */
    public function publish(User $user, string $templateKey): Portfolio
    {
        try {
            $portfolio = $this->getPortfolioForUser($user);

            $portfolio->update([
                'status' => self::STATUS_PENDING_REVIEW,
                'is_public' => false,
                'review_status' => 'pending',
                'review_comment' => null,
                'reviewed_at' => null,
                'template_key' => $templateKey,
                'public_slug' => $portfolio->public_slug ?: $this->generateUniqueSlug($user),
            ]);

            return $portfolio->fresh();
        } catch (\Exception $e) {
            Log::error("Failed to send portfolio to review for user {$user->id}: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * despublica portafolio, ya no queda publico ni pendiente de revision
     */
    public function unpublish(User $user): Portfolio
    {
        try {
            $portfolio = $this->getPortfolioForUser($user);

            $portfolio->update([
                'status' => self::STATUS_UNPUBLISHED,
                'is_public' => false,
                'review_status' => null,
                'review_comment' => null,
                'reviewed_at' => null,
            ]);

            return $portfolio->fresh();
        } catch (\Exception $e) {
            Log::error("Failed to unpublish portfolio for user {$user->id}: {$e->getMessage()}");
            throw $e;
        }
    }

    private function generateUniqueSlug(User $user): string
    {
        $base = Str::slug($user->full_name ?: 'usuario') ?: 'usuario';
        $slug = $base;
        $counter = 1;

        while (Portfolio::where('public_slug', $slug)->exists()) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}