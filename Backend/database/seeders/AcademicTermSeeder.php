<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use Illuminate\Database\Seeder;

class AcademicTermSeeder extends Seeder
{
    public function run(): void
    {
        $terms = [
            [
                'academic_year' => '2025-2026',
                'semester' => '1st',
                'start_date' => '2025-08-11',
                'end_date' => '2025-12-19',
                'status' => 'active',
            ],
            [
                'academic_year' => '2025-2026',
                'semester' => '2nd',
                'start_date' => '2026-01-05',
                'end_date' => '2026-05-15',
                'status' => 'active',
            ],
        ];

        foreach ($terms as $term) {
            AcademicTerm::create($term);
        }
    }
}