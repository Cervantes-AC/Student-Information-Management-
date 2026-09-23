<?php

namespace Tests;

use App\Models\User;

trait InteractsAsApi
{
    /**
     * Create a user with the given role and act as them (Sanctum guard).
     */
    protected function apiAs(string $role, array $overrides = []): User
    {
        $user = User::factory()->role($role)->create($overrides);

        $this->actingAs($user, 'sanctum');

        return $user;
    }

    /**
     * Post to the login endpoint with the given credentials.
     */
    protected function loginAs(string $email, string $password = 'password'): array
    {
        return $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
        ])->json();
    }
}