<?php

namespace App\Models;

use App\Enums\RecordStatus;
use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'status' => RecordStatus::class,
        ];
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    public function instructorOfferings(): HasMany
    {
        return $this->hasMany(CourseOffering::class, 'instructor_id');
    }

    public function isAdministrator(): bool
    {
        return $this->role === Role::Administrator;
    }

    public function isRegistrar(): bool
    {
        return $this->role === Role::Registrar;
    }

    public function isInstructor(): bool
    {
        return $this->role === Role::Instructor;
    }

    public function isStudent(): bool
    {
        return $this->role === Role::Student;
    }

    public function isStaff(): bool
    {
        return in_array($this->role, [Role::Administrator, Role::Registrar], true);
    }
}