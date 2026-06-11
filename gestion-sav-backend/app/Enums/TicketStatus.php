<?php

declare(strict_types=1);

namespace App\Enums;

enum TicketStatus: string
{
    case New = 'New';
    case InProgress = 'In_Progress';
    case Resolved = 'Resolved';
}
