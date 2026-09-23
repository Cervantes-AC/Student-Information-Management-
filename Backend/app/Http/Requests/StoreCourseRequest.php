<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code' => ['required', 'string', 'max:20', 'unique:courses,course_code'],
            'course_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'units' => ['sometimes', 'numeric', 'between:0.5,10'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'course_code.unique' => 'A course with this code already exists.',
        ];
    }
}