<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'integer', Rule::exists('enrollments', 'id')],
            'midterm_grade' => ['nullable', 'numeric', 'between:1,5'],
            'final_grade' => ['nullable', 'numeric', 'between:1,5'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'enrollment_id.exists' => 'The selected enrollment does not exist.',
            'midterm_grade.between' => 'The midterm grade must be between 1.00 and 5.00.',
            'final_grade.between' => 'The final grade must be between 1.00 and 5.00.',
        ];
    }
}