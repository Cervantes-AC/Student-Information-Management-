<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'course_code' => strtoupper(fake()->lexify('???')).'-'.fake()->unique()->numberBetween(100, 999),
            'course_title' => fake()->words(5, true),
            'description' => fake()->sentence(),
            'units' => fake()->randomElement([2.0, 3.0, 4.0]),
            'status' => 'active',
        ];
    }
}