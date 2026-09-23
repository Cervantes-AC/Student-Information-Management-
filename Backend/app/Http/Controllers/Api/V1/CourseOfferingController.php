<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseOfferingRequest;
use App\Http\Requests\UpdateCourseOfferingRequest;
use App\Models\CourseOffering;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use App\Support\Presenters;
use Illuminate\Http\Request;

class CourseOfferingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = CourseOffering::query();

        if ($user->isInstructor()) {
            $query->where('instructor_id', $user->id);
        }

        $result = CollectionQuery::apply(
            $query,
            searchable: ['section', 'room'],
            filterable: ['course_id', 'academic_term_id', 'instructor_id', 'status'],
            sortable: ['id', 'section', 'capacity', 'created_at'],
        );

        return ApiResponse::success(
            collect($result['items'])->map(fn (CourseOffering $offering) => Presenters::offering($offering))->all(),
            'Course offerings retrieved successfully.',
            $result['meta'],
        );
    }

    public function show(Request $request, CourseOffering $courseOffering)
    {
        $this->authorizeOfferingAccess($courseOffering);

        return ApiResponse::success(Presenters::offering($courseOffering), 'Course offering retrieved successfully.');
    }

    public function store(StoreCourseOfferingRequest $request)
    {
        $offering = CourseOffering::create($request->validated());

        return ApiResponse::success(Presenters::offering($offering->refresh()), 'Course offering created successfully.', [], 201);
    }

    public function update(UpdateCourseOfferingRequest $request, CourseOffering $courseOffering)
    {
        $courseOffering->update($request->validated());

        return ApiResponse::success(Presenters::offering($courseOffering->fresh()), 'Course offering updated successfully.');
    }

    /**
     * DELETE deactivates the offering. 204, no body.
     */
    public function destroy(CourseOffering $courseOffering)
    {
        $courseOffering->update(['status' => 'inactive']);

        return response()->noContent();
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