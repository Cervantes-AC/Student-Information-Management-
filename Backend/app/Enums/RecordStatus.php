<?php

namespace App\Enums;

enum RecordStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';

    public function label(): string
    {
        return $this === self::Active ? 'Active' : 'Inactive';
    }
}