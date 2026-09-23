<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'string', 'max:20', Rule::unique('programs', 'code')->ignore($this->route('program'))],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'A program with this code already exists.',
        ];
    }
}