<?php

namespace Tests\Feature;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\InteractsAsApi;
use Tests\TestCase;

class StudentManagementTest extends TestCase
{
    use InteractsAsApi, RefreshDatabase;

    public function test_staff_can_list_students_with_pagination_meta(): void
    {
        $this->apiAs('administrator');
        Student::factory()->count(30)->create();

        $this->getJson('/api/v1/students?per_page=10&page=2')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 30)
            ->assertJsonCount(10, 'data');
    }

    public function test_staff_can_search_and_filter_students(): void
    {
        $this->apiAs('administrator');

        $program = Program::factory()->create();
        Student::factory()->create(['last_name' => 'Dela Cruz', 'program_id' => $program->id, 'year_level' => 3]);
        Student::factory()->create(['last_name' => 'Reyes', 'program_id' => $program->id, 'year_level' => 1]);

        $this->getJson('/api/v1/students?search=dela')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.last_name', 'Dela Cruz');

        $this->getJson('/api/v1/students?year_level=1')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.last_name', 'Reyes');
    }

    public function test_staff_can_sort_students(): void
    {
        $this->apiAs('administrator');
        Student::factory()->create(['last_name' => 'Bravo']);
        Student::factory()->create(['last_name' => 'Alpha']);

        $this->getJson('/api/v1/students?sort=last_name&order=asc')
            ->assertStatus(200)
            ->assertJsonPath('data.0.last_name', 'Alpha')
            ->assertJsonPath('data.1.last_name', 'Bravo');
    }

    public function test_staff_can_create_a_student(): void
    {
        $this->apiAs('administrator');
        $program = Program::factory()->create();

        $this->postJson('/api/v1/students', [
            'student_number' => '2026-12345',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'program_id' => $program->id,
            'year_level' => 2,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.student_number', '2026-12345')
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('students', ['student_number' => '2026-12345']);
    }

    public function test_duplicate_student_number_is_rejected_with_422(): void
    {
        $this->apiAs('administrator');
        $student = Student::factory()->create();
        $program = Program::factory()->create();

        $this->postJson('/api/v1/students', [
            'student_number' => $student->student_number,
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'program_id' => $program->id,
            'year_level' => 2,
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['student_number']]);
    }

    public function test_staff_can_update_a_student(): void
    {
        $this->apiAs('administrator');
        $student = Student::factory()->create();

        $this->putJson("/api/v1/students/{$student->id}", [
            'year_level' => 4,
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.year_level', 4);
    }

    public function test_deactivate_student_returns_204_and_flips_status(): void
    {
        $this->apiAs('administrator');
        $student = Student::factory()->create();

        $this->deleteJson("/api/v1/students/{$student->id}")
            ->assertStatus(204);

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'status' => RecordStatus::Inactive->value,
        ]);
    }

    public function test_student_can_view_their_own_profile(): void
    {
        $account = User::factory()->role(Role::Student->value)->create();
        $student = Student::factory()->create(['user_id' => $account->id]);

        $this->actingAs($account, 'sanctum');

        $this->getJson("/api/v1/students/{$student->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $student->id);
    }

    public function test_student_cannot_view_another_students_profile(): void
    {
        $account = User::factory()->role(Role::Student->value)->create();
        Student::factory()->create(['user_id' => $account->id]);
        $other = Student::factory()->create();

        $this->actingAs($account, 'sanctum');

        $this->getJson("/api/v1/students/{$other->id}")
            ->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    public function test_student_cannot_list_all_students(): void
    {
        $this->apiAs(Role::Student->value);

        $this->getJson('/api/v1/students')
            ->assertStatus(403);
    }

    public function test_instructor_cannot_list_all_students(): void
    {
        $this->apiAs(Role::Instructor->value);

        $this->getJson('/api/v1/students')
            ->assertStatus(403);
    }

    public function test_student_cannot_create_students(): void
    {
        $this->apiAs(Role::Student->value);

        $this->postJson('/api/v1/students', [])
            ->assertStatus(403);
    }
}