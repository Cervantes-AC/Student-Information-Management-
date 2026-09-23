<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // A few recognizable records for demos (e.g. search=de la cruz).
        $featured = [
            [
                'student_number' => '2026-00001',
                'first_name' => 'Juan',
                'middle_name' => 'Reyes',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@sims.test',
                'program_index' => 0,
                'year_level' => 3,
            ],
            [
                'student_number' => '2026-00002',
                'first_name' => 'Maria',
                'middle_name' => 'Santos',
                'last_name' => 'Dela Cruz',
                'email' => 'maria.delacruz@sims.test',
                'program_index' => 1,
                'year_level' => 2,
            ],
            [
                'student_number' => '2026-00003',
                'first_name' => 'Ana',
                'middle_name' => null,
                'last_name' => 'Reyes',
                'email' => 'ana.reyes@sims.test',
                'program_index' => 2,
                'year_level' => 1,
            ],
            [
                'student_number' => '2026-00004',
                'first_name' => 'Carlos',
                'middle_name' => 'Villanueva',
                'last_name' => 'Garcia',
                'email' => 'carlos.garcia@sims.test',
                'program_index' => 0,
                'year_level' => 4,
            ],
            [
                'student_number' => '2026-00005',
                'first_name' => 'Bianca',
                'middle_name' => 'Lopez',
                'last_name' => 'Domingo',
                'email' => 'bianca.domingo@sims.test',
                'program_index' => 1,
                'year_level' => 2,
            ],
        ];

        foreach ($featured as $index => $data) {
            Student::create([
                'student_number' => $data['student_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'],
                'last_name' => $data['last_name'],
                'birth_date' => now()->subYears(18 + $data['year_level'])->toDateString(),
                'email' => $data['email'],
                'contact_number' => '0917'.str_pad((string) (7000000 + $index), 7, '0', STR_PAD_LEFT),
                'address' => 'Brgy. '.fake()->word().', Manila',
                'program_id' => $data['program_index'] + 1,
                'year_level' => $data['year_level'],
                'status' => 'active',
            ]);
        }

        // 95 more generated students to reach the required 100 total,
        // assigned to the programs seeded in ProgramSeeder (ids 1-3).
        $programs = [1, 2, 3];

        foreach (range(1, 95) as $i) {
            Student::create([
                'student_number' => fake()->unique()->numerify('20##-####'),
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->optional()->lastName(),
                'last_name' => fake()->lastName(),
                'birth_date' => fake()->dateTimeBetween('-30 years', '-17 years')->format('Y-m-d'),
                'email' => fake()->unique()->safeEmail(),
                'contact_number' => fake()->numerify('09#########'),
                'address' => fake()->address(),
                'program_id' => fake()->randomElement($programs),
                'year_level' => fake()->numberBetween(1, 5),
                'status' => 'active',
            ]);
        }
    }
}