<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\User;
use App\Services\SkillService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function __construct(
        private readonly SkillService $skillService,
    ) {}

    /**
     * GET /api/skills
     *
     * List all skills for the authenticated user, grouped by type.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $grouped = $this->skillService->getUserSkills($user);

        return response()->json([
            'technical' => SkillResource::collection($grouped['technical']),
            'soft'      => SkillResource::collection($grouped['soft']),
        ]);
    }

    /**
     * POST /api/skills
     *
     * Create a new skill for the authenticated user.
     */
    public function store(StoreSkillRequest $request): JsonResponse
    {
        $user  = $this->resolveUser($request);
        $skill = $this->skillService->create($user, $request->validated());

        return response()->json([
            'message' => 'Habilidad creada exitosamente.',
            'data'    => new SkillResource($skill),
        ], 201);
    }

    /**
     * PUT|PATCH /api/skills/{id}
     *
     * Update an existing skill for the authenticated user.
     */
    public function update(UpdateSkillRequest $request, int $id): JsonResponse
    {
        $user  = $this->resolveUser($request);
        $skill = $this->skillService->update($user, $id, $request->validated());

        return response()->json([
            'message' => 'Habilidad actualizada exitosamente.',
            'data'    => new SkillResource($skill),
        ]);
    }

    /**
     * DELETE /api/skills/{id}
     *
     * Delete a skill for the authenticated user.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $this->skillService->delete($user, $id);

        return response()->json([
            'message' => 'Habilidad eliminada exitosamente.',
        ]);
    }

    /**
     * Resolve the authenticated User model from the Clerk ID
     * injected by the ClerkAuth middleware.
     *
     * Creates the user record on first contact (upsert pattern)
     * so that the frontend developer doesn't need an explicit
     * "register" endpoint — Clerk handles registration.
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
