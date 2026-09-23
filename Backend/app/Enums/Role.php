<?php

namespace App\Enums;

enum Role: string
{
    case Administrator = 'administrator';
    case Registrar = 'registrar';
    case Instructor = 'instructor';
    case Student = 'student';

    /**
     * Roles that manage academic records.
     */
    public static function staffRoles(): array
    {
        return [self::Administrator->value, self::Registrar->value];
    }

    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'Administrator',
            self::Registrar => 'Registrar / Staff',
            self::Instructor => 'Instructor',
            self::Student => 'Student',
        };
    }
}