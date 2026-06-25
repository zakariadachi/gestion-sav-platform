<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Admin sees all. Technicians see assigned. Clients see owned.
     */
    public function viewAny(User $user): bool
    {
        return true; // Scoping is done in the query, not in the gate.
    }

    /**
     * Can this user view a specific ticket?
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return match ($user->role) {
            UserRole::Admin      => true,
            UserRole::Technician => $ticket->technician_id === $user->id,
            UserRole::Client     => $ticket->client_id === $user->id,
        };
    }

    /**
     * Only clients can create tickets.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Client;
    }

    /**
     * Admin can update anything.
     * Technicians can update tickets assigned to them.
     * Clients can update tickets they created.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return match ($user->role) {
            UserRole::Admin      => true,
            UserRole::Technician => $ticket->technician_id === $user->id,
            UserRole::Client     => $ticket->client_id === $user->id,
        };
    }

    /**
     * Only admins can assign a technician to a ticket.
     */
    public function assign(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only the assigned technician (or an admin) can change status.
     */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return match ($user->role) {
            UserRole::Admin      => true,
            UserRole::Technician => $ticket->technician_id === $user->id,
            default              => false,
        };
    }

    /**
     * Can this user edit a ticket's content (title, description, priority)?
     *
     * Business rule: a Client may only edit their own ticket while it is
     * still in 'New' status — i.e., before a technician has been assigned.
     * Admins may edit at any time.
     * Technicians never edit ticket content (they update status only).
     *
     * NOTE: This is intentionally a SEPARATE method from `update`, which is
     * reused by TicketCommentController and must not restrict by status.
     */
    public function edit(User $user, Ticket $ticket): bool
    {
        return match ($user->role) {
            UserRole::Admin  => true,
            UserRole::Client => $ticket->client_id === $user->id
                                && $ticket->status  === TicketStatus::New,
            default          => false,
        };
    }

    /**
     * Can this user reopen a ticket?
     */
    public function reopen(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Client
               && $ticket->client_id === $user->id
               && $ticket->status === TicketStatus::Resolved;
    }

    /**
     * Can this user rate the ticket?
     */
    public function rate(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Client
               && $ticket->client_id === $user->id
               && $ticket->status === TicketStatus::Resolved
               && $ticket->rating === null;
    }

    /**
     * Only admins can delete tickets.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only clients can view their own report statistics.
     */
    public function viewOwnReports(User $user): bool
    {
        return $user->role === UserRole::Client;
    }

    /**
     * Only admins can view aggregate dashboard statistics.
     */
    public function viewStats(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }
}
