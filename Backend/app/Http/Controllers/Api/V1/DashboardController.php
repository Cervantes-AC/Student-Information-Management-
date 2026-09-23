<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Student;
use App\Models\AcademicTerm;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->isStaff()) {
            return ApiResponse::success([
                'students' => Student::count(),
                'programs' => Program::count(),
                'courses' => Course::count(),
                'academic_terms' => AcademicTerm::count(),
                'course_offerings' => CourseOffering::count(),
                'enrollments' => Enrollment::count(),
                'active_enrollments' => Enrollment::where('status', 'enrolled')->count(),
                'instructors' => User::where('role', 'instructor')->count(),
            ], 'Dashboard statistics retrieved successfully.');
        }

        if ($user->isInstructor()) {
            $offeringIds = CourseOffering::where('instructor_id', $user->id)->pluck('id');
            $enrollmentIds = Enrollment::whereIn('course_offering_id', $offeringIds)->pluck('id');

            return ApiResponse::success([
                'assigned_offerings' => $offeringIds->count(),
                'enrolled_students' => Enrollment::whereIn('course_offering_id', $offeringIds)
                    ->where('status', 'enrolled')
                    ->count(),
                'grades_encoded' => Grade::whereIn('enrollment_id', $enrollmentIds)->count(),
            ], 'Dashboard statistics retrieved successfully.');
        }

        $student = $user->student;

        return ApiResponse::success([
            'enrollments' => $student ? $student->enrollments()->count() : 0,
            'active_enrollments' => $student
                ? $student->enrollments()->where('status', 'enrolled')->count()
                : 0,
            'grades_encoded' => $student
                ? Grade::whereIn('enrollment_id', $student->enrollments()->pluck('id'))->count()
                : 0,
        ], 'Dashboard statistics retrieved successfully.');
    }
}