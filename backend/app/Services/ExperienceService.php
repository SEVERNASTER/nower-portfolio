<?php

namespace App\Services;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ExperienceService
{
    /**
     * Get all experiences for a user, ordered by start_date descending.
     */
    public function getUserExperiences(User $user): Collection
    {
        return $user->experiences()->orderBy('start_date', 'desc')->get();
    }

    /**
     * Create a new experience for the given user.
     *
     * @param  array{type: string, title: string, institution: string, start_date?: string, end_date?: string, description?: string}  $data
     */
    public function create(User $user, array $data): Experience
    {
        return $user->experiences()->create($data);
    }

    /**
     * Update an existing experience, ensuring it belongs to the user.
     *
     * @param  array{type?: string, title?: string, institution?: string, start_date?: string, end_date?: string, description?: string}  $data
     *
     * @throws ModelNotFoundException
     */
    public function update(User $user, int $experienceId, array $data): Experience
    {
        $experience = $this->findOrFail($user, $experienceId);
        $experience->update($data);

        return $experience->fresh();
    }

    /**
     * Delete an experience, ensuring it belongs to the user.
     *
     * @throws ModelNotFoundException
     */
    public function delete(User $user, int $experienceId): void
    {
        $experience = $this->findOrFail($user, $experienceId);
        $experience->delete();
    }

    /**
     * Find an experience that belongs to the user or throw 404.
     *
     * @throws ModelNotFoundException
     */
    private function findOrFail(User $user, int $experienceId): Experience
    {
        return $user->experiences()->findOrFail($experienceId);
    }
}
