<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Support\ApiResponse;
use App\Support\Presenters;

/**
 * GET /api/v1/course-offerings/{course_offering}/students
 */
class OfferingStudentController extends Controller
{
    public function index(CourseOffering $courseOffering)
    {
        $this->authorizeOfferingAccess($courseOffering);

        $enrollments = Enrollment::with(['student.program', 'grade'])
            ->where('course_offering_id', $courseOffering->id)
            ->where('status', 'enrolled')
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            $enrollments->map(fn (Enrollment $enrollment) => [
                'enrollment_id' => $enrollment->id,
                'enrollment_date' => $enrollment->enrollment_date?->toDateString(),
                'student' => Presenters::student($enrollment->student),
                'grade' => $enrollment->grade ? Presenters::grade($enrollment->grade) : null,
            ])->all(),
            'Enrolled students retrieved successfully.',
        );
    }

    private function authorizeOfferingAccess(CourseOffering $offering): void
    {
        $user = request()->user();

        if ($user->isStaff()) {
            return;
        }

        if ($user->isInstructor()) {
            abort_unless($offering->instructor_id === $user->id, 403, 'You can only view your own course offerings.');

            return;
        }

        abort(403, 'You are not authorized to view this record.');
    }
}