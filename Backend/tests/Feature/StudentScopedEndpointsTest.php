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

class StudentScopedEndpointsTest extends TestCase
{
    use InteractsAsApi, RefreshDatabase;

    private function linkedStudent(): array
    {
        $account = User::factory()->role(Role::Student->value)->create();
        $student = Student::factory()->create(['user_id' => $account->id]);

        return [$account, $student];
    }

    private function enrollWithGrade(Student $student): Enrollment
    {
        $instructor = User::factory()->role('instructor')->create();
        $offering = CourseOffering::factory()->create([
            'course_id' => Course::factory()->create(['units' => 3.0]),
            'academic_term_id' => AcademicTerm::factory()->create(['academic_year' => '2025-2026', 'semester' => '1st']),
            'instructor_id' => $instructor->id,
        ]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_offering_id' => $offering->id,
        ]);
        Grade::factory()->create(['enrollment_id' => $enrollment->id]);

        return $enrollment;
    }

    public function test_student_can_view_their_own_enrollments(): void
    {
        [$account, $student] = $this->linkedStudent();
        $this->enrollWithGrade($student);

        $this->actingAs($account, 'sanctum');

        $this->getJson("/api/v1/students/{$student->id}/enrollments")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id', 'status', 'student', 'course_offering' => ['course', 'academic_term'], 'grade',
                ]],
            ]);
    }

    public function test_student_cannot_view_another_students_enrollments(): void
    {
        [$account] = $this->linkedStudent();
        [$otherAccount] = $this->linkedStudent();
        $other = Student::where('user_id', $otherAccount->id)->first();

        $this->actingAs($account, 'sanctum');

        $this->getJson("/api/v1/students/{$other->id}/enrollments")
            ->assertStatus(403);
    }

    public function test_student_can_view_own_grades(): void
    {
        [$account, $student] = $this->linkedStudent();
        $this->enrollWithGrade($student);

        $this->actingAs($account, 'sanctum');

        $this->getJson('/api/v1/my/grades')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure(['data' => [['id', 'midterm_grade', 'final_grade', 'course']]]);
    }

    public function test_academic_record_aggregates_by_term_with_average(): void
    {
        [$account, $student] = $this->linkedStudent();
        $this->enrollWithGrade($student);

        $this->actingAs($account, 'sanctum');

        $response = $this->getJson("/api/v1/students/{$student->id}/academic-record")
            ->assertStatus(200);

        $json = $response->json();
        $this->assertCount(1, $json['data']['terms']);
        $this->assertNotNull($json['data']['terms'][0]['average']);
        $this->assertNotNull($json['data']['overall_average']);
    }

    public function test_self_service_enrollments_mirror_student_endpoint(): void
    {
        [$account, $student] = $this->linkedStudent();
        $this->enrollWithGrade($student);

        $this->actingAs($account, 'sanctum');

        $this->getJson('/api/v1/my/enrollments')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_instructor_can_view_their_class_roster(): void
    {
        $instructor = $this->apiAs(Role::Instructor->value);
        $offering = CourseOffering::factory()->create([
            'course_id' => Course::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'instructor_id' => $instructor->id,
        ]);
        Enrollment::factory()->create(['course_offering_id' => $offering->id]);

        $this->getJson("/api/v1/course-offerings/{$offering->id}/students")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure(['data' => [['enrollment_id', 'student', 'grade']]]);
    }

    public function test_student_cannot_view_class_roster(): void
    {
        $this->apiAs(Role::Student->value);
        $instructor = User::factory()->role('instructor')->create();
        $offering = CourseOffering::factory()->create([
            'course_id' => Course::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'instructor_id' => $instructor->id,
        ]);

        $this->getJson("/api/v1/course-offerings/{$offering->id}/students")
            ->assertStatus(403);
    }

    public function test_dashboard_stats_follow_role(): void
    {
        $this->apiAs('administrator');
        Student::factory()->count(3)->create();
        Enrollment::factory()->count(5)->create();

        // The enrollment factory cascades its own student/offering records,
        // so assert the meaningful invariants rather than exact cascade counts.
        $response = $this->getJson('/api/v1/dashboard/stats')
            ->assertStatus(200);
        $payload = $response->json('data');
        $this->assertGreaterThanOrEqual(3, $payload['students']);
        $this->assertSame(5, $payload['enrollments']);

        $this->apiAs(Role::Instructor->value);
        $this->getJson('/api/v1/dashboard/stats')
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['assigned_offerings', 'enrolled_students', 'grades_encoded']]);
    }
}