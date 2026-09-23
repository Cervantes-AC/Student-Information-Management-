<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $result = CollectionQuery::apply(
            Course::query(),
            searchable: ['course_code', 'course_title'],
            filterable: ['status'],
            sortable: ['id', 'course_code', 'course_title', 'units', 'created_at'],
        );

        return ApiResponse::success($result['items'], 'Courses retrieved successfully.', $result['meta']);
    }

    public function show(Course $course)
    {
        return ApiResponse::success($course, 'Course retrieved successfully.');
    }

    public function store(StoreCourseRequest $request)
    {
        $course = Course::create($request->validated());

        return ApiResponse::success($course, 'Course created successfully.', [], 201);
    }

    public function update(UpdateCourseRequest $request, Course $course)
    {
        $course->update($request->validated());

        return ApiResponse::success($course->fresh(), 'Course updated successfully.');
    }

    /**
     * DELETE deactivates the course. 204, no body.
     */
    public function destroy(Course $course)
    {
        $course->update(['status' => 'inactive']);

        return response()->noContent();
    }
}