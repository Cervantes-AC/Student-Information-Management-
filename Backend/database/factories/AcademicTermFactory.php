<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicTerm>
 */
class AcademicTermFactory extends Factory
{
    protected $model = AcademicTerm::class;

    public function definition(): array
    {
        $semesters = ['1st', '2nd', 'Summer'];

        return [
            'academic_year' => fake()->unique()->numberBetween(2020, 2030).'-'.fake()->numberBetween(21, 31),
            'semester' => fake()->randomElement($semesters),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'status' => 'active',
        ];
    }
}