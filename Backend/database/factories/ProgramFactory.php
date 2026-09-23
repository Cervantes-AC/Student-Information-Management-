<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('PRG-####'),
            'name' => fake()->unique()->words(4, true),
            'description' => fake()->sentence(),
            'status' => 'active',
        ];
    }
}