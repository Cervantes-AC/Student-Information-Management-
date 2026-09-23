<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    /** @use HasFactory<\Database\Factories\AcademicTermFactory> */
    use HasFactory;

    protected $fillable = ['academic_year', 'semester', 'start_date', 'end_date', 'status'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => RecordStatus::class,
        ];
    }

    public function offerings(): HasMany
    {
        return $this->hasMany(CourseOffering::class);
    }

    public function displayName(): string
    {
        return ucfirst($this->semester).' Semester, S.Y. '.$this->academic_year;
    }
}