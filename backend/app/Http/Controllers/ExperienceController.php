<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\User;
use App\Services\ExperienceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function __construct(
        private readonly ExperienceService $experienceService,
    ) {}

    /**
     * GET /api/experience
     *
     * List all experiences for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $experiences = $this->experienceService->getUserExperiences($user);

        return response()->json(ExperienceResource::collection($experiences));
    }

    /**
     * POST /api/experience
     *
     * Create a new experience for the authenticated user.
     */
    public function store(StoreExperienceRequest $request): JsonResponse
    {
        $user       = $this->resolveUser($request);
        $experience = $this->experienceService->create($user, $request->validated());

        return response()->json([
            'message' => 'Experiencia creada exitosamente.',
            'data'    => new ExperienceResource($experience),
        ], 201);
    }

    /**
     * GET /api/experience/{id}
     * 
     * Get a specific experience. We don't implement this strictly since the frontend usually loads all at once, 
     * but provided for REST completeness if needed.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        // We reuse the service's findOrFail method by making a quick reflection or creating a public method.
        // Actually, let's just do it directly or use a public method in service. For now, since Service findOrFail is private,
        // we can fetch via model here.
        $experience = $user->experiences()->findOrFail($id);

        return response()->json([
            'data' => new ExperienceResource($experience),
        ]);
    }

    /**
     * PUT|PATCH /api/experience/{id}
     *
     * Update an existing experience for the authenticated user.
     */
    public function update(UpdateExperienceRequest $request, int $id): JsonResponse
    {
        $user       = $this->resolveUser($request);
        $experience = $this->experienceService->update($user, $id, $request->validated());

        return response()->json([
            'message' => 'Experiencia actualizada exitosamente.',
            'data'    => new ExperienceResource($experience),
        ]);
    }

    /**
     * DELETE /api/experience/{id}
     *
     * Delete an experience for the authenticated user.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $this->experienceService->delete($user, $id);

        return response()->json([
            'message' => 'Experiencia eliminada exitosamente.',
        ]);
    }

    /**
     * Resolve the authenticated User model from the Clerk ID
     * injected by the ClerkAuth middleware.
     */
    private function resolveUser(Request $request): User
    {
        $clerkId = $request->attributes->get('clerk_user_id');

        return User::firstOrCreate(
            ['clerk_id' => $clerkId],
            [
                'full_name' => 'New User',
                'email'     => $clerkId . '@placeholder.com',
            ]
        );
    }
}
