<?php

namespace Database\Seeders;

use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::pluck('id');
        $offerings = CourseOffering::pluck('id');

        $seen = [];
        $created = 0;
        $statuses = ['enrolled', 'enrolled', 'enrolled', 'completed', 'dropped'];

        while ($created < 200) {
            $studentId = $students->random();
            $offeringId = $offerings->random();
            $key = $studentId.'-'.$offeringId;

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;

            Enrollment::create([
                'student_id' => $studentId,
                'course_offering_id' => $offeringId,
                'enrollment_date' => now()->subDays(rand(30, 180))->toDateString(),
                'status' => $statuses[array_rand($statuses)],
            ]);

            $created++;
        }
    }
}