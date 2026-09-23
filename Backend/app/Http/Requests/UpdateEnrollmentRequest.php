<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enrollment_date' => ['sometimes', 'date'],
            'status' => ['sometimes', Rule::in(['enrolled', 'dropped', 'completed'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'The enrollment status must be enrolled, dropped, or completed.',
        ];
    }
}