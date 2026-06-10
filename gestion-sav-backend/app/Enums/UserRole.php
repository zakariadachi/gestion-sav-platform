<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case Client = 'Client';
    case Technician = 'Technician';
}
