<?php

namespace Tests\Feature;

use App\Enums\RecordStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\InteractsAsApi;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use InteractsAsApi, RefreshDatabase;

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/students')
            ->assertStatus(401)
            ->assertJson(['success' => false])
            ->assertJsonMissingPath('data');
    }

    public function test_user_can_log_in_with_valid_credentials(): void
    {
        $user = User::factory()->role('administrator')->create();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => ['token', 'user' => ['id', 'name', 'email', 'role', 'status']],
            ]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->role('administrator')->create(['email' => 'admin@test.dev']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.dev',
            'password' => 'wrong-password',
        ])
            ->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_login_rejects_inactive_account(): void
    {
        User::factory()->role('administrator')->create([
            'status' => RecordStatus::Inactive->value,
        ]);

        $user = User::first();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    public function test_authenticated_user_can_fetch_their_profile(): void
    {
        $user = $this->apiAs('administrator');

        $this->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.role', 'administrator');
    }

    public function test_user_can_log_out_and_token_is_revoked(): void
    {
        $this->apiAs('administrator');

        $this->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}