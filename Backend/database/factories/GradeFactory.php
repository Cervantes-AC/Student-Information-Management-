<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Grade>
 */
class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition(): array
    {
        $midterm = fake()->randomFloat(2, 1.0, 5.0);
        $final = fake()->randomFloat(2, 1.0, 5.0);

        return [
            'enrollment_id' => Enrollment::factory(),
            'midterm_grade' => $midterm,
            'final_grade' => $final,
            'remarks' => min($midterm, $final) <= 3.0 ? 'PASSED' : 'FAILED',
        ];
    }
}