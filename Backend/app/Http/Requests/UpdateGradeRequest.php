<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'midterm_grade' => ['nullable', 'numeric', 'between:1,5'],
            'final_grade' => ['nullable', 'numeric', 'between:1,5'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'midterm_grade.between' => 'The midterm grade must be between 1.00 and 5.00.',
            'final_grade.between' => 'The final grade must be between 1.00 and 5.00.',
        ];
    }
}