<?php

namespace App\Services;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
            $this->ensureBasicProfileIsComplete($user);

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

    private function ensureBasicProfileIsComplete(User $user): void
    {
        $missingFields = $this->getMissingBasicProfileFields($user);

        if (!empty($missingFields)) {
            throw ValidationException::withMessages([
                'profile' => [
                    'Completa la información minima requerida antes de enviar el portafolio a revisión.',
                ],
                'missing_fields' => $missingFields,
            ]);
        }
    }

    private function getMissingBasicProfileFields(User $user): array
    {
        $user->loadMissing([
            'socialLinks',
            'projects',
            'skills',
            'experiences',
        ]);

        $missingFields = [];

        if (!trim((string) $user->full_name)) {
            $missingFields[] = 'Nombre completo';
        }

        if (!trim((string) $user->profession)) {
            $missingFields[] = 'Profesión';
        }

        if (!trim((string) $user->bio)) {
            $missingFields[] = 'Biografía personal';
        }

        if (!trim((string) $user->email)) {
            $missingFields[] = 'Correo electrónico';
        }

        if (!preg_match('/^[0-9]{8}$/', (string) $user->phone)) {
            $missingFields[] = 'Teléfono';
        }

        if (!trim((string) $user->city)) {
            $missingFields[] = 'Ciudad';
        }

        if ($user->socialLinks->isEmpty()) {
            $missingFields[] = 'Red profesional';
        }

        if ($user->projects->isEmpty()) {
            $missingFields[] = 'Mínimo 1 proyecto';
        }

        if ($user->skills->count() < 3) {
            $missingFields[] = 'Mínimo 3 habilidades';
        }

        $hasAcademicExperience = $user->experiences
            ->where('type', 'academic')
            ->isNotEmpty();

        if (!$hasAcademicExperience) {
            $missingFields[] = 'Formación académica';
        }

        return $missingFields;
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
