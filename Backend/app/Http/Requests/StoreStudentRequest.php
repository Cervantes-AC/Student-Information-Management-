<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_number' => ['required', 'string', 'max:20', 'unique:students,student_number'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255', 'unique:students,email'],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'program_id' => ['required', 'integer', Rule::exists('programs', 'id')],
            'year_level' => ['required', 'integer', 'between:1,5'],
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