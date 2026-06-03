<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get all users that have created at least one project, along with their projects and skills.
     */
    public function getUsersData(Request $request): JsonResponse
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

    public function getSystemMetrics(Request $request): JsonResponse
    {
        $usersMetrics = [
            'registered_total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'normal_users' => User::where('role', 'user')->count(),
            'password_pending' => User::where('must_change_password', true)->count(),
        ];

        $portfolioQuery = Portfolio::query();

        $portfolioMetrics = [
            'approved' => (clone $portfolioQuery)
                ->where('status', 'published')
                ->where('is_public', true)
                ->where('review_status', 'approved')
                ->count(),

            'rejected' => (clone $portfolioQuery)
                ->where('review_status', 'rejected')
                ->count(),

            'pending_review' => (clone $portfolioQuery)
                ->where('status', 'pending_review')
                ->count(),

            'unpublished' => (clone $portfolioQuery)
                ->where('status', 'unpublished')
                ->count(),
        ];

        return response()->json([
            'users' => $usersMetrics,
            'portfolios' => $portfolioMetrics,
        ]);
    }
}
