<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseOfferingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['sometimes', 'integer', Rule::exists('courses', 'id')],
            'academic_term_id' => ['sometimes', 'integer', Rule::exists('academic_terms', 'id')],
            'instructor_id' => [
                'sometimes',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'instructor')),
            ],
            'section' => ['sometimes', 'string', 'max:20'],
            'schedule' => ['nullable', 'string', 'max:100'],
            'room' => ['nullable', 'string', 'max:50'],
            'capacity' => ['sometimes', 'integer', 'between:1,500'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'instructor_id.exists' => 'The selected instructor is not a valid instructor account.',
        ];
    }
}