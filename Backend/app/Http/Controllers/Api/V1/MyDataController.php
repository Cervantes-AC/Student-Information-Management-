<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Support\ApiResponse;
use App\Support\Presenters;
use Illuminate\Http\Request;

/**
 * Student self-service endpoints (student role only).
 * GET /api/v1/my/enrollments
 * GET /api/v1/my/grades
 * GET /api/v1/my/academic-record
 */
class MyDataController extends Controller
{
    public function enrollments(Request $request)
    {
        $student = $this->studentOrFail($request);

        $enrollments = $student->enrollments()
            ->with(['student.program', 'courseOffering.course', 'courseOffering.academicTerm', 'grade'])
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            $enrollments->map(fn (Enrollment $enrollment) => Presenters::enrollment($enrollment))->all(),
            'Your enrollments retrieved successfully.',
        );
    }

    public function grades(Request $request)
    {
        $student = $this->studentOrFail($request);

        $grades = Grade::with(['enrollment.courseOffering.course', 'enrollment.courseOffering.academicTerm'])
            ->whereIn('enrollment_id', $student->enrollments()->pluck('id'))
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            $grades->map(function (Grade $grade) {
                $payload = Presenters::grade($grade);
                $offering = $grade->enrollment?->courseOffering;

                $payload['course'] = $offering?->course
                    ? [
                        'course_code' => $offering->course->course_code,
                        'course_title' => $offering->course->course_title,
                    ]
                    : null;
                $payload['section'] = $offering?->section;
                $payload['academic_term'] = $offering?->academicTerm
                    ? Presenters::term($offering->academicTerm)
                    : null;

                return $payload;
            })->all(),
            'Your grades retrieved successfully.',
        );
    }

    public function academicRecord(Request $request)
    {
        $student = $this->studentOrFail($request);

        $controller = app(AcademicRecordController::class);

        return $controller->index($student);
    }

    private function studentOrFail(Request $request): \App\Models\Student
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $student = $user->student;

        abort_if($student === null, 404, 'No linked student record found for this account.');

        return $student;
    }
}