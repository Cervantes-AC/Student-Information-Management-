<?php

namespace App\Enums;

enum EnrollmentStatus: string
{
    case Enrolled = 'enrolled';
    case Dropped = 'dropped';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Enrolled => 'Enrolled',
            self::Dropped => 'Dropped',
            self::Completed => 'Completed',
        };
    }
}