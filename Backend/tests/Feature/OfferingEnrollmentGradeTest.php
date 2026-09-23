<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\InteractsAsApi;
use Tests\TestCase;

class OfferingEnrollmentGradeTest extends TestCase
{
    use InteractsAsApi, RefreshDatabase;

    private function makeOffering(User $instructor): CourseOffering
    {
        return CourseOffering::factory()->create([
            'course_id' => Course::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'instructor_id' => $instructor->id,
        ]);
    }

    public function test_instructor_only_sees_their_own_offerings(): void
    {
        $instructor = $this->apiAs(Role::Instructor->value);
        $this->makeOffering($instructor);
        $this->makeOffering($instructor);

        $other = User::factory()->role('instructor')->create();
        $this->makeOffering($other);

        $this->getJson('/api/v1/course-offerings')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 2);
    }

    public function test_staff_can_create_a_course_offering(): void
    {
        $this->apiAs('administrator');
        $instructor = User::factory()->role('instructor')->create();

        $this->postJson('/api/v1/course-offerings', [
            'course_id' => Course::factory()->create()->id,
            'academic_term_id' => AcademicTerm::factory()->create()->id,
            'instructor_id' => $instructor->id,
            'section' => 'A-1',
            'capacity' => 40,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.section', 'A-1');
    }

    public function test_offering_rejects_non_instructor_account(): void
    {
        $this->apiAs('administrator');
        $studentAccount = User::factory()->role('student')->create();

        $this->postJson('/api/v1/course-offerings', [
            'course_id' => Course::factory()->create()->id,
            'academic_term_id' => AcademicTerm::factory()->create()->id,
            'instructor_id' => $studentAccount->id,
            'section' => 'A-1',
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['instructor_id']]);
    }

    public function test_staff_can_create_an_enrollment(): void
    {
        $this->apiAs('administrator');
        $instructor = User::factory()->role('instructor')->create();
        $offering = $this->makeOffering($instructor);
        $student = Student::factory()->create();

        $this->postJson('/api/v1/enrollments', [
            'student_id' => $student->id,
            'course_offering_id' => $offering->id,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.status', 'enrolled');
    }

    public function test_duplicate_enrollment_returns_409(): void
    {
        $this->apiAs('administrator');
        $instructor = User::factory()->role('instructor')->create();
        $offering = $this->makeOffering($instructor);
        Enrollment::factory()->create(['course_offering_id' => $offering->id]);

        $enrollment = Enrollment::first();

        $this->postJson('/api/v1/enrollments', [
            'student_id' => $enrollment->student_id,
            'course_offering_id' => $enrollment->course_offering_id,
        ])
            ->assertStatus(409)
            ->assertJson(['success' => false]);
    }

    public function test_dropping_an_enrollment_returns_204(): void
    {
        $this->apiAs('administrator');
        $enrollment = Enrollment::factory()->create();

        $this->deleteJson("/api/v1/enrollments/{$enrollment->id}")
            ->assertStatus(204);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'dropped',
        ]);
    }

    public function test_student_cannot_create_enrollments(): void
    {
        $this->apiAs(Role::Student->value);

        $this->postJson('/api/v1/enrollments', [])
            ->assertStatus(403);
    }

    public function test_instructor_can_encode_grade_for_own_offering(): void
    {
        $instructor = $this->apiAs(Role::Instructor->value);
        $offering = $this->makeOffering($instructor);
        $enrollment = Enrollment::factory()->create(['course_offering_id' => $offering->id]);

        $this->postJson('/api/v1/grades', [
            'enrollment_id' => $enrollment->id,
            'final_grade' => 1.75,
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.final_grade', 1.75);
    }

    public function test_instructor_cannot_grade_enrollment_in_foreign_offering(): void
    {
        $instructor = $this->apiAs(Role::Instructor->value);
        $other = User::factory()->role('instructor')->create();
        $offering = $this->makeOffering($other);
        $enrollment = Enrollment::factory()->create(['course_offering_id' => $offering->id]);

        $this->postJson('/api/v1/grades', [
            'enrollment_id' => $enrollment->id,
            'final_grade' => 1.75,
        ])
            ->assertStatus(403);
    }

    public function test_grade_outside_range_is_rejected(): void
    {
        $instructor = $this->apiAs(Role::Instructor->value);
        $offering = $this->makeOffering($instructor);
        $enrollment = Enrollment::factory()->create(['course_offering_id' => $offering->id]);

        $this->postJson('/api/v1/grades', [
            'enrollment_id' => $enrollment->id,
            'final_grade' => 5.5,
        ])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['final_grade']]);
    }

    public function test_duplicate_grade_for_enrollment_returns_409(): void
    {
        $instructor = $this->apiAs('administrator');
        $offering = $this->makeOffering(User::factory()->role('instructor')->create());
        $enrollment = Enrollment::factory()->create(['course_offering_id' => $offering->id]);
        Grade::factory()->create(['enrollment_id' => $enrollment->id]);

        $this->postJson('/api/v1/grades', [
            'enrollment_id' => $enrollment->id,
            'final_grade' => 1.5,
        ])
            ->assertStatus(409);
    }

    public function test_student_cannot_encode_grades(): void
    {
        $this->apiAs(Role::Student->value);

        $this->postJson('/api/v1/grades', [])
            ->assertStatus(403);
    }
}