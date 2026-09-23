<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'student_number' => fake()->unique()->numerify('20##-####'),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional()->lastName(),
            'last_name' => fake()->lastName(),
            'suffix' => fake()->optional(0.05)->randomElement(['Jr.', 'Sr.', 'III']),
            'birth_date' => fake()->dateTimeBetween('-30 years', '-17 years')->format('Y-m-d'),
            'email' => fake()->unique()->safeEmail(),
            'contact_number' => fake()->numerify('09#########'),
            'address' => fake()->address(),
            'program_id' => Program::factory(),
            'year_level' => fake()->numberBetween(1, 5),
            'status' => 'active',
        ];
    }
}