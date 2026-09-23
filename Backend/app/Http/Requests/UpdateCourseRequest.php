<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code' => ['sometimes', 'string', 'max:20', Rule::unique('courses', 'course_code')->ignore($this->route('course'))],
            'course_title' => ['sometimes', 'string', 'max:255'],
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