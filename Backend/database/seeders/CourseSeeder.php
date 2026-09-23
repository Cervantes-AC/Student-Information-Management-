<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            ['course_code' => 'IT101', 'course_title' => 'Introduction to Computing', 'units' => 3.0],
            ['course_code' => 'IT102', 'course_title' => 'Computer Programming 1', 'units' => 3.0],
            ['course_code' => 'IT103', 'course_title' => 'Discrete Mathematics', 'units' => 3.0],
            ['course_code' => 'IT104', 'course_title' => 'Data Structures and Algorithms', 'units' => 3.0],
            ['course_code' => 'IT105', 'course_title' => 'Information Management', 'units' => 3.0],
            ['course_code' => 'IT106', 'course_title' => 'Web Systems and Technologies', 'units' => 3.0],
            ['course_code' => 'IT107', 'course_title' => 'Networking 1', 'units' => 3.0],
            ['course_code' => 'IT108', 'course_title' => 'Systems Analysis and Design', 'units' => 3.0],
            ['course_code' => 'IT109', 'course_title' => 'Software Engineering 1', 'units' => 3.0],
            ['course_code' => 'IT110', 'course_title' => 'Information Assurance and Security', 'units' => 3.0],
            ['course_code' => 'CS101', 'course_title' => 'Programming Logic and Design', 'units' => 3.0],
            ['course_code' => 'CS102', 'course_title' => 'Object-Oriented Programming', 'units' => 3.0],
            ['course_code' => 'CS103', 'course_title' => 'Algorithms and Complexity', 'units' => 3.0],
            ['course_code' => 'CS104', 'course_title' => 'Database Systems', 'units' => 3.0],
            ['course_code' => 'CS105', 'course_title' => 'Computer Organization', 'units' => 3.0],
            ['course_code' => 'CS106', 'course_title' => 'Operating Systems', 'units' => 3.0],
            ['course_code' => 'CS107', 'course_title' => 'Artificial Intelligence', 'units' => 3.0],
            ['course_code' => 'IS101', 'course_title' => 'Enterprise Architecture', 'units' => 3.0],
            ['course_code' => 'IS102', 'course_title' => 'Business Process Management', 'units' => 3.0],
            ['course_code' => 'GE101', 'course_title' => 'The Contemporary World', 'units' => 3.0],
        ];

        foreach ($courses as $course) {
            Course::create(array_merge($course, [
                'description' => null,
                'status' => 'active',
            ]));
        }
    }
}