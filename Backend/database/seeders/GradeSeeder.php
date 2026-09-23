<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $enrollments = Enrollment::inRandomOrder()->take(100)->pluck('id');

        foreach ($enrollments as $enrollmentId) {
            $midterm = round(1.0 + mt_rand(0, 400) / 100, 2);
            $final = round(1.0 + mt_rand(0, 400) / 100, 2);
            $passing = min($midterm, $final) <= 3.0;

            Grade::create([
                'enrollment_id' => $enrollmentId,
                'midterm_grade' => $midterm,
                'final_grade' => $final,
                'remarks' => $passing ? 'PASSED' : 'FAILED',
            ]);
        }
    }
}