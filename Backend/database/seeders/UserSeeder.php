<?php

namespace Database\Seeders;

use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@sims.test',
                'password' => Hash::make('password'),
                'role' => Role::Administrator->value,
                'status' => RecordStatus::Active->value,
            ],
            [
                'name' => 'Registrar Staff',
                'email' => 'registrar@sims.test',
                'password' => Hash::make('password'),
                'role' => Role::Registrar->value,
                'status' => RecordStatus::Active->value,
            ],
            [
                'name' => 'Prof. Maria Santos',
                'email' => 'instructor@sims.test',
                'password' => Hash::make('password'),
                'role' => Role::Instructor->value,
                'status' => RecordStatus::Active->value,
            ],
            [
                'name' => 'Prof. Juan Dela Cruz',
                'email' => 'instructor2@sims.test',
                'password' => Hash::make('password'),
                'role' => Role::Instructor->value,
                'status' => RecordStatus::Active->value,
            ],
            [
                'name' => 'Student User',
                'email' => 'student@sims.test',
                'password' => Hash::make('password'),
                'role' => Role::Student->value,
                'status' => RecordStatus::Active->value,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}