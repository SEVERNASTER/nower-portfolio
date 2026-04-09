<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function sync(Request $request)
    {
        $user = User::updateOrCreate(
            ['clerk_id' => $request->clerk_id],
            [
                'full_name' => $request->full_name,
                'email' => $request->email,
                'profession' => $request->profession ?? null,
                'bio' => $request->bio ?? null,
                'role' => $request->role ?? 'user',
            ]
        );

        return response()->json($user);
    }
}