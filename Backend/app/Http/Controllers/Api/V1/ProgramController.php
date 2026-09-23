<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $result = CollectionQuery::apply(
            Program::query(),
            searchable: ['code', 'name'],
            filterable: ['status'],
            sortable: ['id', 'code', 'name', 'created_at'],
        );

        return ApiResponse::success($result['items'], 'Programs retrieved successfully.', $result['meta']);
    }

    public function show(Program $program)
    {
        return ApiResponse::success($program, 'Program retrieved successfully.');
    }

    public function store(StoreProgramRequest $request)
    {
        $program = Program::create($request->validated());

        return ApiResponse::success($program->refresh(), 'Program created successfully.', [], 201);
    }

    public function update(UpdateProgramRequest $request, Program $program)
    {
        $program->update($request->validated());

        return ApiResponse::success($program->fresh(), 'Program updated successfully.');
    }

    /**
     * DELETE deactivates the program. 204, no body.
     */
    public function destroy(Program $program)
    {
        $program->update(['status' => 'inactive']);

        return response()->noContent();
    }
}