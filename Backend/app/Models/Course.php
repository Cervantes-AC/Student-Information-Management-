<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory;

    protected $fillable = ['course_code', 'course_title', 'description', 'units', 'status'];

    protected function casts(): array
    {
        return [
            'units' => 'decimal:1',
            'status' => RecordStatus::class,
        ];
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
    }
}