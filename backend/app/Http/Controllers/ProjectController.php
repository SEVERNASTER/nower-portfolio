<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Al ser función de administrador, listamos todos los proyectos (READ)
        $projects = Project::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

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
        ]);

        // Ya validado por AdminAuth, el usuario se inyectó en attributes
        $user = $request->attributes->get('auth_user');
        
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

        return response()->json($project, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        // READ DETAIL: Muestra el detalle del proyecto, incluyendo información de quién lo creó
        return response()->json($project->load('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string',
            'evidence_url' => 'nullable|string',
            'tags' => 'sometimes|required|array',
            'tags.*' => 'string|max:50',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}