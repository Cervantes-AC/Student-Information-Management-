<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_year' => ['sometimes', 'string', 'max:20'],
            'semester' => ['sometimes', Rule::in(['1st', '2nd', 'Summer'])],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'semester.in' => 'The semester must be 1st, 2nd, or Summer.',
        ];
    }
}