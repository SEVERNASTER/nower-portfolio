<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('portfolios', 'content_dirty')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->boolean('content_dirty')->default(false);
            });
        }

        if (!Schema::hasColumn('portfolios', 'approved_content')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->json('approved_content')->nullable();
            });
        }

        $this->backfillApprovedContent();
    }

    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            if (Schema::hasColumn('portfolios', 'approved_content')) {
                $table->dropColumn('approved_content');
            }

            if (Schema::hasColumn('portfolios', 'content_dirty')) {
                $table->dropColumn('content_dirty');
            }
        });
    }

    private function backfillApprovedContent(): void
    {
        DB::table('portfolios')
            ->where('status', 'published')
            ->where('is_public', true)
            ->where('review_status', 'approved')
            ->whereNull('approved_content')
            ->chunkById(50, function ($portfolios) {
                foreach ($portfolios as $portfolio) {
                    DB::table('portfolios')
                        ->where('id', $portfolio->id)
                        ->update([
                            'approved_content' => json_encode([
                                'approved_at' => now()->toISOString(),
                                'user' => $this->buildUserSnapshot($portfolio->user_id),
                            ]),
                        ]);
                }
            });
    }

    private function buildUserSnapshot(int $userId): ?array
    {
        $user = DB::table('users')
            ->select([
                'id',
                'full_name',
                'email',
                'clerk_id',
                'profession',
                'bio',
                'role',
                'imagen_profile',
                'phone',
                'city',
                'created_at',
                'updated_at',
            ])
            ->where('id', $userId)
            ->first();

        if (!$user) {
            return null;
        }

        $snapshot = $this->rowToArray($user);
        $snapshot['social_links'] = $this->rowsToArray(
            DB::table('social_links')->where('user_id', $userId)->orderBy('id')->get()
        );
        $snapshot['skills'] = $this->rowsToArray(
            DB::table('skills')->where('user_id', $userId)->orderBy('id')->get()
        );
        $snapshot['experiences'] = $this->rowsToArray(
            DB::table('experiences')->where('user_id', $userId)->orderBy('id')->get()
        );
        $snapshot['projects'] = $this->projectSnapshots($userId);
        $snapshot['achievements'] = $this->achievementSnapshots($userId);

        return $snapshot;
    }

    private function projectSnapshots(int $userId): array
    {
        return DB::table('projects')
            ->where('user_id', $userId)
            ->orderBy('id')
            ->get()
            ->map(function ($project) {
                $snapshot = $this->rowToArray($project);
                $snapshot['tags'] = $this->decodeJsonValue($snapshot['tags'] ?? null) ?? [];
                $snapshot['links'] = $this->rowsToArray(
                    DB::table('project_links')->where('project_id', $project->id)->orderBy('id')->get()
                );
                $snapshot['images'] = $this->rowsToArray(
                    DB::table('project_images')->where('project_id', $project->id)->orderBy('id')->get()
                );

                return $snapshot;
            })
            ->all();
    }

    private function achievementSnapshots(int $userId): array
    {
        return DB::table('achievements')
            ->where('user_id', $userId)
            ->orderBy('id')
            ->get()
            ->map(function ($achievement) {
                $snapshot = $this->rowToArray($achievement);
                $snapshot['files'] = $this->rowsToArray(
                    DB::table('achievement_files')->where('achievement_id', $achievement->id)->orderBy('id')->get()
                );

                return $snapshot;
            })
            ->all();
    }

    private function rowsToArray($rows): array
    {
        return $rows->map(fn ($row) => $this->rowToArray($row))->all();
    }

    private function rowToArray(object $row): array
    {
        return json_decode(json_encode($row), true);
    }

    private function decodeJsonValue($value): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        return json_decode($value, true);
    }
};
