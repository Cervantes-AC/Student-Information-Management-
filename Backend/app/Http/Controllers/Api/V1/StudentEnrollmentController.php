<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Student;
use App\Support\ApiResponse;
use App\Support\Presenters;

/**
 * GET /api/v1/students/{student}/enrollments
 */
class StudentEnrollmentController extends Controller
{
    public function index(Student $student)
    {
        $this->authorizeStudentAccess($student);

        $enrollments = Enrollment::with(['student.program', 'courseOffering.course', 'courseOffering.academicTerm', 'grade'])
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            $enrollments->map(fn (Enrollment $enrollment) => Presenters::enrollment($enrollment))->all(),
            'Student enrollments retrieved successfully.',
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