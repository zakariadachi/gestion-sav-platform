<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    /**
     * Only admins can list the team (admins + technicians).
     */
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Admins and Technicians can view the client list.
     */
    public function viewClients(User $user): bool
    {
        return $user->role === UserRole::Admin || $user->role === UserRole::Technician;
    }

    /**
     * Only admins can view a specific user's full profile.
     */
    public function view(User $user, User $targetUser): bool
    {
        return $user->role === UserRole::Admin || $user->id === $targetUser->id;
    }

    /**
     * Only admins can create new users.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admins can update other users.
     */
    public function update(User $user, User $targetUser): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admins can delete users.
     */
    public function delete(User $user, User $targetUser): bool
    {
        return $user->role === UserRole::Admin;
    }
}
