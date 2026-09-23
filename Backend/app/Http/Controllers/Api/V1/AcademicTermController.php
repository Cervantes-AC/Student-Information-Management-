<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAcademicTermRequest;
use App\Http\Requests\UpdateAcademicTermRequest;
use App\Models\AcademicTerm;
use App\Support\ApiResponse;
use App\Support\CollectionQuery;
use App\Support\Presenters;
use Illuminate\Http\Request;

class AcademicTermController extends Controller
{
    public function index(Request $request)
    {
        $result = CollectionQuery::apply(
            AcademicTerm::query(),
            searchable: ['academic_year', 'semester'],
            filterable: ['status'],
            sortable: ['id', 'academic_year', 'semester', 'created_at'],
        );

        return ApiResponse::success(
            collect($result['items'])->map(fn (AcademicTerm $term) => Presenters::term($term))->all(),
            'Academic terms retrieved successfully.',
            $result['meta'],
        );
    }

    public function show(AcademicTerm $academicTerm)
    {
        return ApiResponse::success(Presenters::term($academicTerm), 'Academic term retrieved successfully.');
    }

    public function store(StoreAcademicTermRequest $request)
    {
        $term = AcademicTerm::create($request->validated());

        return ApiResponse::success(Presenters::term($term->refresh()), 'Academic term created successfully.', [], 201);
    }

    public function update(UpdateAcademicTermRequest $request, AcademicTerm $academicTerm)
    {
        $academicTerm->update($request->validated());

        return ApiResponse::success(Presenters::term($academicTerm->fresh()), 'Academic term updated successfully.');
    }

    /**
     * DELETE deactivates the term. 204, no body.
     */
    public function destroy(AcademicTerm $academicTerm)
    {
        $academicTerm->update(['status' => 'inactive']);

        return response()->noContent();
    }
}