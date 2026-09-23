<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProgramSeeder::class,      // 3
            UserSeeder::class,         // 5 (admin, registrar, 2 instructors, student account)
            StudentSeeder::class,      // 100
            CourseSeeder::class,       // 20
            AcademicTermSeeder::class, // 2
            CourseOfferingSeeder::class, // 20
            EnrollmentSeeder::class,   // 200 (unique student+offering pairs)
            GradeSeeder::class,        // 100
        ]);

        // Link the student demo account to the first student record.
        $account = User::where('email', 'student@sims.test')->first();
        if ($account) {
            Student::orderBy('id')->first()?->update(['user_id' => $account->id]);
        }
    }
}