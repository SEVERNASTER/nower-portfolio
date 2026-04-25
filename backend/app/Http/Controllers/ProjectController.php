<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectLinkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    protected $projectLinkService;

    public function __construct(ProjectLinkService $projectLinkService)
    {
        $this->projectLinkService = $projectLinkService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        if ($user->role === 'admin') {
            $projects = Project::with(['user', 'links'])->orderBy('created_at', 'desc')->get();
        } else {
            $projects = Project::with(['user', 'links'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar integridad de datos: validar nombre, descripción y tecnologías
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'evidence_url' => 'nullable|string',
            'tags' => 'required|array',
            'tags.*' => 'string|max:50',
            'links' => 'nullable|array',
            'links.*.platform_name' => 'required_with:links|string|max:50',
            'links.*.url' => 'required_with:links|url|max:255',
        ]);

        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();
        
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $project = Project::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'evidence_url' => $validated['evidence_url'] ?? null,
            'tags' => $validated['tags'],
        ]);

        if (isset($validated['links'])) {
            $this->projectLinkService->syncLinks($project, $validated['links']);
        }

        return response()->json($project->load('links'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $clerkId = request()->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user || ($user->role !== 'admin' && $project->user_id !== $user->id)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // READ DETAIL: Muestra el detalle del proyecto
        return response()->json($project->load(['user', 'links']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user || ($user->role !== 'admin' && $project->user_id !== $user->id)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string',
            'evidence_url' => 'nullable|string',
            'tags' => 'sometimes|required|array',
            'tags.*' => 'string|max:50',
            'links' => 'sometimes|nullable|array',
            'links.*.platform_name' => 'required_with:links|string|max:50',
            'links.*.url' => 'required_with:links|url|max:255',
        ]);

        $project->update($validated);

        if (array_key_exists('links', $validated)) {
            $this->projectLinkService->syncLinks($project, $validated['links'] ?? []);
        }

        return response()->json($project->load('links'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $clerkId = request()->attributes->get('clerk_user_id');
        $user = \App\Models\User::where('clerk_id', $clerkId)->first();

        if (!$user || ($user->role !== 'admin' && $project->user_id !== $user->id)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}