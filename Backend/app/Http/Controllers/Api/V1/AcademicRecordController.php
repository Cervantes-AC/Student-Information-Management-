<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Student;
use App\Support\ApiResponse;
use App\Support\Presenters;
use Illuminate\Support\Collection;

/**
 * GET /api/v1/students/{student}/academic-record
 *
 * Aggregates a student's grades grouped by academic term, with a per-term
 * and overall weighted grade-point average.
 */
class AcademicRecordController extends Controller
{
    public function index(Student $student)
    {
        $this->authorizeStudentAccess($student);

        $enrollments = Enrollment::with([
            'courseOffering.course',
            'courseOffering.academicTerm',
            'grade',
        ])
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->get();

        $grouped = $enrollments
            ->groupBy(fn (Enrollment $enrollment) => $enrollment->courseOffering?->academic_term_id ?? 'ungrouped')
            ->map(fn (Collection $items) => $this->termSummary($items))
            ->values();

        $overall = $this->overallAverage($enrollments);

        return ApiResponse::success([
            'student' => Presenters::student($student),
            'terms' => $grouped,
            'overall_average' => $overall,
        ], 'Academic record retrieved successfully.');
    }

    /**
     * @param  Collection<int, Enrollment>  $items
     */
    private function termSummary(Collection $items): array
    {
        $term = $items->first()->courseOffering?->academicTerm;
        $courses = $items->map(function (Enrollment $enrollment) {
            $offering = $enrollment->courseOffering;
            $grade = $enrollment->grade;

            return [
                'enrollment_id' => $enrollment->id,
                'status' => $enrollment->status->value,
                'course' => $offering?->course
                    ? [
                        'course_code' => $offering->course->course_code,
                        'course_title' => $offering->course->course_title,
                        'units' => (float) $offering->course->units,
                    ]
                    : null,
                'section' => $offering?->section,
                'midterm_grade' => $grade?->midterm_grade === null ? null : (float) $grade->midterm_grade,
                'final_grade' => $grade?->final_grade === null ? null : (float) $grade->final_grade,
                'remarks' => $grade?->remarks,
                'grade_point' => $this->gradePoint($grade?->final_grade ?? $grade?->midterm_grade),
            ];
        })->all();

        $graded = collect($courses)->filter(fn (array $course) => $course['grade_point'] !== null);
        $average = $graded->isEmpty()
            ? null
            : round($graded->avg('grade_point'), 2);

        return [
            'academic_term' => $term ? Presenters::term($term) : null,
            'average' => $average,
            'courses' => $courses,
        ];
    }

    /**
     * @param  Collection<int, Enrollment>  $enrollments
     */
    private function overallAverage(Collection $enrollments): ?float
    {
        $points = $enrollments
            ->map(fn (Enrollment $enrollment) => $this->gradePoint(
                $enrollment->grade?->final_grade ?? $enrollment->grade?->midterm_grade,
            ))
            ->filter(fn ($point) => $point !== null);

        if ($points->isEmpty()) {
            return null;
        }

        $weights = $enrollments
            ->filter(fn (Enrollment $enrollment) => $this->gradePoint(
                $enrollment->grade?->final_grade ?? $enrollment->grade?->midterm_grade,
            ) !== null)
            ->map(fn (Enrollment $enrollment) => (float) ($enrollment->courseOffering?->course?->units ?? 1.0));

        $sumWeighted = $points->zip($weights)
            ->map(fn ($pair) => $pair[0] * $pair[1])
            ->sum();

        $totalUnits = $weights->sum();

        return $totalUnits > 0 ? round($sumWeighted / $totalUnits, 2) : null;
    }

    private function gradePoint(?string $grade): ?float
    {
        if ($grade === null) {
            return null;
        }

        $value = (float) $grade;

        return $value >= 1.0 && $value <= 5.0 ? $value : null;
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