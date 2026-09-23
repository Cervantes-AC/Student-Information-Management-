<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return ApiResponse::error('The provided credentials are incorrect.', [], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->status === RecordStatus::Inactive) {
            Auth::logout();

            return ApiResponse::error('This account has been deactivated.', [], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'user' => $this->userPayload($user),
        ], 'Login successful.');
    }

    public function me(Request $request)
    {
        return ApiResponse::success($this->userPayload($request->user()), 'Current user retrieved successfully.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    private function userPayload(\App\Models\User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'role_label' => $user->role->label(),
            'status' => $user->status->value,
            'student_id' => $user->student?->id,
        ];
    }
}