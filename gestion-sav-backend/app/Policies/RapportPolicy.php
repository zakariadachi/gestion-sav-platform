<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Rapport;
use App\Models\User;
use App\Enums\UserRole;

class RapportPolicy
{
    /**
     * Determine if the given rapport can be updated by the user.
     */
    public function update(User $user, Rapport $rapport): bool
    {
        // Admins can update any rapport.
        // Otherwise, only the technician assigned to the ticket can update the rapport.
        return $user->role === UserRole::Admin->value || 
               $user->id === $rapport->ticket->technician_id;
    }
}
