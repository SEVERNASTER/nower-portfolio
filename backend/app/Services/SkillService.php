<?php

namespace App\Services;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SkillService
{
    /**
     * Get all skills for a user, grouped by type.
     *
     * @return array{technical: Collection, soft: Collection}
     */
    public function getUserSkills(User $user): array
    {
        $skills = $user->skills()->orderBy('name')->get();

        return [
            'technical' => $skills->where('type', 'technical')->values(),
            'soft'      => $skills->where('type', 'soft')->values(),
        ];
    }

    /**
     * Create a new skill for the given user.
     *
     * @param  array{name: string, type: string, proficiency_level: int}  $data
     */
    public function create(User $user, array $data): Skill
    {
        return $user->skills()->create($data);
    }

    /**
     * Update an existing skill, ensuring it belongs to the user.
     *
     * @param  array{name?: string, type?: string, proficiency_level?: int}  $data
     *
     * @throws ModelNotFoundException
     */
    public function update(User $user, int $skillId, array $data): Skill
    {
        $skill = $this->findOrFail($user, $skillId);
        $skill->update($data);

        return $skill->fresh();
    }

    /**
     * Delete a skill, ensuring it belongs to the user.
     *
     * @throws ModelNotFoundException
     */
    public function delete(User $user, int $skillId): void
    {
        $skill = $this->findOrFail($user, $skillId);
        $skill->delete();
    }

    /**
     * Find a skill that belongs to the user or throw 404.
     *
     * @throws ModelNotFoundException
     */
    private function findOrFail(User $user, int $skillId): Skill
    {
        return $user->skills()->findOrFail($skillId);
    }
}
