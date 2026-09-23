<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    /** @use HasFactory<\Database\Factories\ProgramFactory> */
    use HasFactory;

    protected $fillable = ['code', 'name', 'description', 'status'];

    protected function casts(): array
    {
        return [
            'status' => RecordStatus::class,
        ];
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}