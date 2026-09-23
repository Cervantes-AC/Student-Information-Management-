<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', Rule::exists('students', 'id')],
            'course_offering_id' => ['required', 'integer', Rule::exists('course_offerings', 'id')],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['enrolled', 'dropped', 'completed'])],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'The selected student does not exist.',
            'course_offering_id.exists' => 'The selected course offering does not exist.',
        ];
    }
}