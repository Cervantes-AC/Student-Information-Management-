<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseOfferingSeeder extends Seeder
{
    public function run(): void
    {
        $instructors = User::where('role', 'instructor')->pluck('id');
        $terms = AcademicTerm::orderBy('id')->pluck('id');
        $courses = Course::orderBy('id')->pluck('id');

        $schedules = ['MWF 8:00-9:00', 'TTh 10:30-12:00', 'MWF 1:00-2:30', 'TTh 2:30-4:00'];

        $created = 0;
        foreach ($terms as $termId) {
            foreach ($courses->take(10) as $i => $courseId) {
                CourseOffering::create([
                    'course_id' => $courseId,
                    'academic_term_id' => $termId,
                    'instructor_id' => $instructors[$created % $instructors->count()],
                    'section' => chr(65 + ($created % 4)).'-'.$i,
                    'schedule' => $schedules[$created % count($schedules)],
                    'room' => ['B201', 'B203', 'C101', 'C204'][$created % 4],
                    'capacity' => 40,
                    'status' => 'active',
                ]);
                $created++;
            }
        }
    }
}