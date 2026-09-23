<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use App\Support\Presenters;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $result = CollectionQuery::apply(
            Grade::query(),
            searchable: [],
            filterable: ['enrollment_id'],
            sortable: ['id', 'created_at'],
        );

        return ApiResponse::success(
            collect($result['items'])->map(fn (Grade $grade) => Presenters::grade($grade))->all(),
            'Grades retrieved successfully.',
            $result['meta'],
        );
    }

    public function show(Grade $grade)
    {
        return ApiResponse::success(Presenters::grade($grade), 'Grade retrieved successfully.');
    }

    public function store(StoreGradeRequest $request)
    {
        $enrollment = Enrollment::with('courseOffering')->findOrFail($request->input('enrollment_id'));

        $this->authorizeGradeManagement($enrollment, 'encode');

        $gradeExists = Grade::where('enrollment_id', $enrollment->id)->exists();

        if ($gradeExists) {
            return ApiResponse::error('A grade record already exists for this enrollment.', [], 409);
        }

        $grade = Grade::create($request->validated());

        return ApiResponse::success(Presenters::grade($grade), 'Grade recorded successfully.', [], 201);
    }

    public function update(UpdateGradeRequest $request, Grade $grade)
    {
        $enrollment = $grade->enrollment()->with('courseOffering')->firstOrFail();

        $this->authorizeGradeManagement($enrollment, 'update');

        $grade->update($request->validated());

        return ApiResponse::success(Presenters::grade($grade->fresh()), 'Grade updated successfully.');
    }

    /**
     * Admins/registrars may manage any grade; instructors may only manage
     * grades for enrollments in course offerings they teach.
     */
    private function authorizeGradeManagement(Enrollment $enrollment, string $action): void
    {
        $user = request()->user();

        if ($user->isStaff()) {
            return;
        }

        if ($user->isInstructor()) {
            abort_unless(
                $enrollment->courseOffering?->instructor_id === $user->id,
                403,
                'You can only '.$action.' grades for your own course offerings.',
            );

            return;
        }

        abort(403, 'You are not authorized to perform this action.');
    }
}