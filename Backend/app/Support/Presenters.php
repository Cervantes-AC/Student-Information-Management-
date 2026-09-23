<?php

namespace App\Support;

use App\Models\AcademicTerm;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;

/**
 * Central place for JSON shapes returned by the API, so the frontend
 * gets a stable contract regardless of which controller serves the data.
 */
class Presenters
{
    public static function student(Student $student): array
    {
        $student->loadMissing('program');

        return [
            'id' => $student->id,
            'student_number' => $student->student_number,
            'full_name' => $student->fullName(),
            'first_name' => $student->first_name,
            'middle_name' => $student->middle_name,
            'last_name' => $student->last_name,
            'suffix' => $student->suffix,
            'birth_date' => $student->birth_date?->toDateString(),
            'email' => $student->email,
            'contact_number' => $student->contact_number,
            'address' => $student->address,
            'program_id' => $student->program_id,
            'program' => $student->program
                ? ['id' => $student->program->id, 'code' => $student->program->code, 'name' => $student->program->name]
                : null,
            'year_level' => $student->year_level,
            'status' => $student->status->value,
            'created_at' => $student->created_at?->toISOString(),
            'updated_at' => $student->updated_at?->toISOString(),
        ];
    }

    public static function offering(CourseOffering $offering): array
    {
        $offering->loadMissing(['course', 'academicTerm', 'instructor']);

        return [
            'id' => $offering->id,
            'section' => $offering->section,
            'schedule' => $offering->schedule,
            'room' => $offering->room,
            'capacity' => $offering->capacity,
            'status' => $offering->status->value,
            'course' => $offering->course
                ? [
                    'id' => $offering->course->id,
                    'course_code' => $offering->course->course_code,
                    'course_title' => $offering->course->course_title,
                    'units' => (float) $offering->course->units,
                ]
                : null,
            'academic_term' => $offering->academicTerm
                ? self::term($offering->academicTerm)
                : null,
            'instructor' => $offering->instructor
                ? ['id' => $offering->instructor->id, 'name' => $offering->instructor->name, 'email' => $offering->instructor->email]
                : null,
            'created_at' => $offering->created_at?->toISOString(),
        ];
    }

    public static function term(AcademicTerm $term): array
    {
        return [
            'id' => $term->id,
            'academic_year' => $term->academic_year,
            'semester' => $term->semester,
            'display_name' => $term->displayName(),
            'start_date' => $term->start_date?->toDateString(),
            'end_date' => $term->end_date?->toDateString(),
            'status' => $term->status->value,
        ];
    }

    public static function grade(Grade $grade): array
    {
        return [
            'id' => $grade->id,
            'enrollment_id' => $grade->enrollment_id,
            'midterm_grade' => $grade->midterm_grade === null ? null : (float) $grade->midterm_grade,
            'final_grade' => $grade->final_grade === null ? null : (float) $grade->final_grade,
            'remarks' => $grade->remarks,
            'created_at' => $grade->created_at?->toISOString(),
            'updated_at' => $grade->updated_at?->toISOString(),
        ];
    }

    public static function enrollment(Enrollment $enrollment): array
    {
        $enrollment->loadMissing([
            'student.program',
            'courseOffering.course',
            'courseOffering.academicTerm',
            'courseOffering.instructor',
            'grade',
        ]);

        $offerings = $enrollment->courseOffering;

        return [
            'id' => $enrollment->id,
            'enrollment_date' => $enrollment->enrollment_date?->toDateString(),
            'status' => $enrollment->status->value,
            'student' => $enrollment->student ? self::student($enrollment->student) : null,
            'course_offering' => $offerings ? self::offering($offerings) : null,
            'grade' => $enrollment->grade ? self::grade($enrollment->grade) : null,
        ];
    }
}