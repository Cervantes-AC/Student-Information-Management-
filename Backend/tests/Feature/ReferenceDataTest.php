<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\InteractsAsApi;
use Tests\TestCase;

class ReferenceDataTest extends TestCase
{
    use InteractsAsApi, RefreshDatabase;

    public function test_staff_can_create_program(): void
    {
        $this->apiAs('administrator');

        $this->postJson('/api/v1/programs', [
            'code' => 'BSIT',
            'name' => 'Bachelor of Science in Information Technology',
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.code', 'BSIT');
    }

    public function test_duplicate_program_code_is_rejected(): void
    {
        $this->apiAs('administrator');
        Program::factory()->create(['code' => 'BSIT']);

        $this->postJson('/api/v1/programs', [
            'code' => 'BSIT',
            'name' => 'Duplicate Program',
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['code']]);
    }

    public function test_staff_can_update_and_deactivate_a_program(): void
    {
        $this->apiAs('administrator');
        $program = Program::factory()->create();

        $this->patchJson("/api/v1/programs/{$program->id}", ['name' => 'Renamed'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Renamed');

        $this->deleteJson("/api/v1/programs/{$program->id}")
            ->assertStatus(204);

        $this->assertDatabaseHas('programs', ['id' => $program->id, 'status' => 'inactive']);
    }

    public function test_staff_can_create_course(): void
    {
        $this->apiAs('registrar');

        $this->postJson('/api/v1/courses', [
            'course_code' => 'IT101',
            'course_title' => 'Introduction to Computing',
            'units' => 3.0,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.course_code', 'IT101');
    }

    public function test_duplicate_course_code_is_rejected(): void
    {
        $this->apiAs('administrator');
        Course::factory()->create(['course_code' => 'IT101']);

        $this->postJson('/api/v1/courses', [
            'course_code' => 'IT101',
            'course_title' => 'Duplicate',
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['course_code']]);
    }

    public function test_staff_can_manage_academic_terms(): void
    {
        $this->apiAs('administrator');

        $this->postJson('/api/v1/academic-terms', [
            'academic_year' => '2026-2027',
            'semester' => '1st',
            'start_date' => '2026-08-10',
            'end_date' => '2026-12-18',
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.academic_year', '2026-2027');

        $term = AcademicTerm::first();

        $this->patchJson("/api/v1/academic-terms/{$term->id}", ['semester' => '2nd'])
            ->assertStatus(200);

        $this->deleteJson("/api/v1/academic-terms/{$term->id}")
            ->assertStatus(204);
    }

    public function test_duplicate_term_semester_is_rejected(): void
    {
        $this->apiAs('administrator');
        AcademicTerm::factory()->create(['academic_year' => '2026-2027', 'semester' => '1st']);

        $this->postJson('/api/v1/academic-terms', [
            'academic_year' => '2026-2027',
            'semester' => '1st',
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['semester']]);
    }

    public function test_invalid_semester_is_rejected(): void
    {
        $this->apiAs('administrator');

        $this->postJson('/api/v1/academic-terms', [
            'academic_year' => '2026-2027',
            'semester' => 'Third',
        ])
            ->assertStatus(422);
    }

    public function test_instructor_cannot_manage_reference_data(): void
    {
        $this->apiAs(Role::Instructor->value);

        $this->postJson('/api/v1/programs', [
            'code' => 'BSIT',
            'name' => 'Should Fail',
        ])->assertStatus(403);

        $this->postJson('/api/v1/courses', [
            'course_code' => 'X1',
            'course_title' => 'Should Fail',
        ])->assertStatus(403);
    }
}