<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get all users that have created at least one project, along with their projects and skills.
     */
    public function getUsersWithProjects(Request $request)
    {
        $users = User::where('role', 'user')
            ->has('projects')
            ->with([
                'projects.links',
                'projects.images',
                'skills',
                'experiences',
                'portfolio' => function ($query) {
                    $query->whereIn('status', ['pending_review', 'published']);
                },
                'socialLinks',
                'achievements.files'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($users);
    }
}
