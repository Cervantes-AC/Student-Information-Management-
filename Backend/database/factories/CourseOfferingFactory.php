<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseOffering>
 */
class CourseOfferingFactory extends Factory
{
    protected $model = CourseOffering::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'instructor_id' => User::factory()->role('instructor'),
            'section' => strtoupper(fake()->randomLetter()).'-'.fake()->unique()->numberBetween(1, 99),
            'schedule' => fake()->randomElement(['MWF 8:00-9:00', 'TTh 10:30-12:00', 'MWF 1:00-2:30', 'TTh 2:30-4:00']),
            'room' => fake()->randomElement(['B201', 'B203', 'C101', 'C204', 'A105']),
            'capacity' => fake()->numberBetween(20, 60),
            'status' => 'active',
        ];
    }
}