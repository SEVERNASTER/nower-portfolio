<?php

namespace App\Services;

use App\Models\Experience;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

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
     * Academic formations only, newest first.
     */
    public function getUserEducation(User $user): Collection
    {
        return $user->experiences()
            ->where('type', 'academic')
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Same institution + overlapping date ranges are treated as inconsistent.
     *
     * @throws ValidationException
     */
    public function assertAcademicInstitutionTimeline(
        User $user,
        string $institution,
        string $startDate,
        ?string $endDate,
        ?int $excludeExperienceId = null
    ): void {
        $instNorm = mb_strtolower(trim($institution));
        $start    = Carbon::parse($startDate)->startOfDay();
        $newEnd   = $endDate
            ? Carbon::parse($endDate)->endOfDay()
            : Carbon::now()->endOfDay();

        $others = $user->experiences()
            ->where('type', 'academic')
            ->when($excludeExperienceId, fn ($q) => $q->where('id', '!=', $excludeExperienceId))
            ->get();

        foreach ($others as $ex) {
            if (mb_strtolower(trim($ex->institution)) !== $instNorm) {
                continue;
            }

            $exStart = Carbon::parse($ex->start_date)->startOfDay();
            $exEnd   = $ex->end_date
                ? Carbon::parse($ex->end_date)->endOfDay()
                : Carbon::now()->endOfDay();

            if ($start->lte($exEnd) && $exStart->lte($newEnd)) {
                throw ValidationException::withMessages([
                    'start_date' => ['Las fechas se solapan con otra formación en la misma institución.'],
                ]);
            }
        }
    }

    /**
     * Create a new experience for the given user.
     *
     * @param  array{type: string, title: string, institution: string, start_date?: string, end_date?: string, description?: string}  $data
     */
    public function create(User $user, array $data): Experience
    {
        if (($data['type'] ?? '') === 'academic') {
            $this->assertAcademicInstitutionTimeline(
                $user,
                $data['institution'],
                $data['start_date'],
                $data['end_date'] ?? null,
                null
            );
        }

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
        $mergedType = $data['type'] ?? $experience->type;

        if ($mergedType === 'academic') {
            $inst = $data['institution'] ?? $experience->institution;
            $sd   = $data['start_date'] ?? $experience->start_date->format('Y-m-d');
            $ed   = array_key_exists('end_date', $data)
                ? $data['end_date']
                : ($experience->end_date ? $experience->end_date->format('Y-m-d') : null);
            $this->assertAcademicInstitutionTimeline($user, $inst, $sd, $ed, $experience->id);
        }

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
