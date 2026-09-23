<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Support\ApiResponse;
use App\Support\Presenters;

/**
 * GET /api/v1/students/{student}/grades
 */
class StudentGradeController extends Controller
{
    public function index(Student $student)
    {
        $this->authorizeStudentAccess($student);

        $enrollmentIds = $student->enrollments()->pluck('id');

        $grades = Grade::with(['enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->whereIn('enrollment_id', $enrollmentIds)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            $grades->map(function (Grade $grade) use ($enrollmentIds) {
                $payload = Presenters::grade($grade);
                $enrollment = $grade->enrollment;

                $payload['course'] = $enrollment?->courseOffering?->course
                    ? [
                        'course_code' => $enrollment->courseOffering->course->course_code,
                        'course_title' => $enrollment->courseOffering->course->course_title,
                    ]
                    : null;
                $payload['section'] = $enrollment?->courseOffering?->section;
                $payload['academic_term'] = $enrollment?->courseOffering?->academicTerm
                    ? Presenters::term($enrollment->courseOffering->academicTerm)
                    : null;

                return $payload;
            })->all(),
            'Student grades retrieved successfully.',
        );
    }

    private function authorizeStudentAccess(Student $student): void
    {
        $user = request()->user();

        if ($user->isStaff()) {
            return;
        }

        if ($user->isStudent()) {
            abort_unless($student->user_id === $user->id, 403, 'You are not authorized to view this record.');

            return;
        }

        abort(403, 'You are not authorized to view this record.');
    }
}