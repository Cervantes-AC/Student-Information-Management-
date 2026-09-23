<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'student_number',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',
        'email',
        'contact_number',
        'address',
        'program_id',
        'year_level',
        'status',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'year_level' => 'integer',
            'status' => RecordStatus::class,
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function fullName(): string
    {
        $middle = $this->middle_name ? ' '.$this->middle_name.' ' : ' ';
        return trim($this->first_name.$middle.$this->last_name.($this->suffix ? ', '.$this->suffix : ''));
    }
}