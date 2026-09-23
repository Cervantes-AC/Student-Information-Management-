<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use App\Support\Presenters;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query()->with('program');

        $result = CollectionQuery::apply(
            $query,
            searchable: ['student_number', 'first_name', 'middle_name', 'last_name', 'email'],
            filterable: ['program_id', 'year_level', 'status'],
            sortable: ['id', 'student_number', 'last_name', 'first_name', 'year_level', 'created_at'],
        );

        return ApiResponse::success(
            collect($result['items'])->map(fn (Student $student) => Presenters::student($student))->all(),
            'Students retrieved successfully.',
            $result['meta'],
        );
    }

    public function show(Request $request, Student $student)
    {
        $this->authorizeStudentAccess($student);

        return ApiResponse::success(Presenters::student($student), 'Student retrieved successfully.');
    }

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

        return ApiResponse::success(Presenters::student($student->refresh()), 'Student created successfully.', [], 201);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return ApiResponse::success(Presenters::student($student->fresh()), 'Student updated successfully.');
    }

    /**
     * DELETE deactivates the student record (status -> inactive) to preserve
     * referential integrity with enrollments. Returns 204 with no body.
     */
    public function destroy(Request $request, Student $student)
    {
        $student->update(['status' => 'inactive']);

        return response()->noContent();
    }

    /**
     * Object-level authorization:
     * - admins/registrars may access any student
     * - a student may only access their own linked profile
     * - instructors have no direct student access
     */
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