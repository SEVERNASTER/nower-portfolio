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
                'content_dirty' => false,
                'approved_content' => null,
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
            $hasApprovedVersion = !empty($portfolio->approved_content);

            $portfolio->update([
                'status' => self::STATUS_PENDING_REVIEW,
                'is_public' => $hasApprovedVersion,
                'review_status' => 'pending',
                'review_comment' => null,
                'reviewed_at' => null,
                'template_key' => $templateKey,
                'public_slug' => $portfolio->public_slug ?: $this->generateUniqueSlug($user),
                'content_dirty' => $hasApprovedVersion,
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
                'content_dirty' => false,
            ]);

            return $portfolio->fresh();
        } catch (\Exception $e) {
            Log::error("Failed to unpublish portfolio for user {$user->id}: {$e->getMessage()}");
            throw $e;
        }
    }

    public function approve(Portfolio $portfolio, ?string $comment = null): Portfolio
    {
        $portfolio->update([
            'status' => self::STATUS_PUBLISHED,
            'is_public' => true,
            'review_status' => 'approved',
            'review_comment' => $comment,
            'reviewed_at' => now(),
            'content_dirty' => false,
            'approved_content' => $this->buildApprovedContent($portfolio),
        ]);

        return $portfolio->fresh();
    }

    public function reject(Portfolio $portfolio, ?string $comment = null): Portfolio
    {
        $hasApprovedVersion = !empty($portfolio->approved_content);

        $portfolio->update([
            'status' => $hasApprovedVersion
                ? self::STATUS_PUBLISHED
                : self::STATUS_UNPUBLISHED,
            'is_public' => $hasApprovedVersion,
            'review_status' => 'rejected',
            'review_comment' => $comment,
            'reviewed_at' => now(),
            'content_dirty' => $hasApprovedVersion,
        ]);

        return $portfolio->fresh();
    }

    public function markAsDirty(User $user): Portfolio
    {
        $portfolio = $this->getPortfolioForUser($user);

        if ($portfolio->status === self::STATUS_PUBLISHED && $portfolio->review_status === 'approved') {
            $portfolio->update([
                'content_dirty' => true,
            ]);
        }

        return $portfolio->fresh();
    }

    public function hasPublicVersion(Portfolio $portfolio): bool
    {
        return $portfolio->is_public
            && (
                !empty($portfolio->approved_content)
                || (
                    $portfolio->status === self::STATUS_PUBLISHED
                    && $portfolio->review_status === 'approved'
                )
            );
    }

    public function publicUserPayload(Portfolio $portfolio): array
    {
        $approvedContent = $portfolio->approved_content;

        if (is_array($approvedContent) && isset($approvedContent['user'])) {
            return $approvedContent['user'];
        }

        $portfolio->loadMissing($this->publicRelations());

        return $portfolio->user->toArray();
    }

    public function publicRelations(): array
    {
        return [
            'user.socialLinks',
            'user.projects.links',
            'user.projects.images',
            'user.skills',
            'user.experiences',
            'user.achievements.files',
        ];
    }

    private function buildApprovedContent(Portfolio $portfolio): array
    {
        $portfolio->load($this->publicRelations());

        return [
            'approved_at' => now()->toISOString(),
            'user' => $portfolio->user->toArray(),
        ];
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
