<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'description' => 'Focuses on the study, design, development, and implementation of computer software and hardware systems.'],
            ['code' => 'BSCS', 'name' => 'Bachelor of Science in Computer Science', 'description' => 'Emphasizes the theoretical foundations of computing and software development.'],
            ['code' => 'BSIS', 'name' => 'Bachelor of Science in Information Systems', 'description' => 'Focuses on the application of information technology to support business processes.'],
        ];

        foreach ($programs as $program) {
            Program::create(array_merge($program, ['status' => 'active']));
        }
    }
}