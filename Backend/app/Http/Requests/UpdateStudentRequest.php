<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $student = $this->route('student');

        return [
            'student_number' => ['sometimes', 'string', 'max:20', Rule::unique('students', 'student_number')->ignore($student)],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('students', 'email')->ignore($student)],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'program_id' => ['sometimes', 'integer', Rule::exists('programs', 'id')],
            'year_level' => ['sometimes', 'integer', 'between:1,5'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'student_number.unique' => 'The student number is already registered.',
            'email.unique' => 'A student with this email already exists.',
            'program_id.exists' => 'The selected program does not exist.',
        ];
    }
}