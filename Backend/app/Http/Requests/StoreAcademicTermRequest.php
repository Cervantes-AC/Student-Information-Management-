<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAcademicTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', Rule::in(['1st', '2nd', 'Summer'])],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $exists = \App\Models\AcademicTerm::query()
                ->where('academic_year', $this->input('academic_year'))
                ->where('semester', $this->input('semester'));

            if ($this->route('academic_term')) {
                $exists->whereKeyNot($this->route('academic_term')->getKey());
            }

            if ($exists->exists()) {
                $validator->errors()->add('semester', 'An academic term for this semester already exists.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'semester.in' => 'The semester must be 1st, 2nd, or Summer.',
        ];
    }
}