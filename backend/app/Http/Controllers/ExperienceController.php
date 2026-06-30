<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducationRequest;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateEducationRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\User;
use App\Services\ExperienceService;
use App\Services\PortfolioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function __construct(
        private readonly ExperienceService $experienceService,
        private readonly PortfolioService $portfolioService,
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
        $this->portfolioService->markAsDirty($user);

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
        $this->portfolioService->markAsDirty($user);

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
        $this->portfolioService->markAsDirty($user);

        return response()->json([
            'message' => 'Experiencia eliminada exitosamente.',
        ]);
    }

    /**
     * GET /api/education — formación académica del usuario autenticado.
     */
    public function educationIndex(Request $request): JsonResponse
    {
        $user       = $this->resolveUser($request);
        $education = $this->experienceService->getUserEducation($user);

        return response()->json(ExperienceResource::collection($education));
    }

    /**
     * POST /api/education — crea un registro académico (type = academic).
     */
    public function educationStore(StoreEducationRequest $request): JsonResponse
    {
        $user        = $this->resolveUser($request);
        $experience = $this->experienceService->create($user, $request->validated());
        $this->portfolioService->markAsDirty($user);

        return response()->json([
            'message' => 'Formación académica registrada correctamente.',
            'data'    => new ExperienceResource($experience),
        ], 201);
    }

    /**
     * PUT /api/education/{id}
     */
    public function educationUpdate(UpdateEducationRequest $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $data = array_merge($request->validated(), ['type' => 'academic']);
        $experience = $this->experienceService->update($user, $id, $data);
        $this->portfolioService->markAsDirty($user);

        return response()->json([
            'message' => 'Formación académica actualizada correctamente.',
            'data'    => new ExperienceResource($experience),
        ]);
    }

    /**
     * DELETE /api/education/{id}
     */
    public function educationDestroy(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $experience = $user->experiences()
            ->where('type', 'academic')
            ->findOrFail($id);
        $experience->delete();
        $this->portfolioService->markAsDirty($user);

        return response()->json([
            'message' => 'Formación académica eliminada correctamente.',
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
