<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get all users that have created at least one project, along with their projects and skills.
     */
    public function getUsersData(Request $request)
    {
        $users = User::with([
                'projects.links',
                'projects.images',
                'skills',
                'experiences',
                'portfolio',
                'socialLinks',
                'achievements.files'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($users);
    }
}
