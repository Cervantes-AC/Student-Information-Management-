<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Models\Enrollment;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use App\Support\Presenters;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $result = CollectionQuery::apply(
            Enrollment::query(),
            searchable: [],
            filterable: ['student_id', 'course_offering_id', 'status'],
            sortable: ['id', 'enrollment_date', 'created_at'],
        );

        return ApiResponse::success(
            collect($result['items'])->map(fn (Enrollment $enrollment) => Presenters::enrollment($enrollment))->all(),
            'Enrollments retrieved successfully.',
            $result['meta'],
        );
    }

    public function show(Enrollment $enrollment)
    {
        return ApiResponse::success(Presenters::enrollment($enrollment), 'Enrollment retrieved successfully.');
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $exists = Enrollment::where('student_id', $request->input('student_id'))
            ->where('course_offering_id', $request->input('course_offering_id'))
            ->exists();

        if ($exists) {
            return ApiResponse::error('This student is already enrolled in that course offering.', [], 409);
        }

        $enrollment = Enrollment::create($request->validated());

        return ApiResponse::success(Presenters::enrollment($enrollment->refresh()), 'Enrollment created successfully.', [], 201);
    }

    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        $enrollment->update($request->validated());

        return ApiResponse::success(Presenters::enrollment($enrollment->fresh()), 'Enrollment updated successfully.');
    }

    /**
     * DELETE drops the enrollment (status -> dropped). 204, no body.
     */
    public function destroy(Enrollment $enrollment)
    {
        $enrollment->update(['status' => 'dropped']);

        return response()->noContent();
    }
}