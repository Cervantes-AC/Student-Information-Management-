<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    /**
     * List active instructor accounts (read-only repository for assignment forms).
     */
    public function index(Request $request)
    {
        $instructors = User::query()
            ->where('role', 'instructor')
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        return ApiResponse::success($instructors->values(), 'Instructors retrieved successfully.');
    }
}