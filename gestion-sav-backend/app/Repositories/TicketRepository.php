<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TicketRepository
{
    /**
     * Get paginated tickets for a given user, applying role-based scoping and filters.
     *
     * @param User $user
     * @param array $filters [search, status, priority]
     * @return LengthAwarePaginator
     */
    public function getTicketsForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Ticket::with(['client:id,name', 'technician:id,name'])->latest();

        // Scope by role
        match ($user->role) {
            UserRole::Technician => $query->where('technician_id', $user->id),
            UserRole::Client     => $query->where('client_id', $user->id),
            default              => null, // Admin sees all
        };

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                // Guard the bigint comparison: PostgreSQL throws SQLSTATE[22P02]
                // ("invalid input syntax for type bigint") if a non-numeric string
                // is compared against the id column. Only add this condition when
                // the search term is a valid integer representation.
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }

                $q->orWhere('title', 'like', "%{$search}%")
                  ->orWhereHas('client',     fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('technician', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        return $query->paginate(15);
    }

    /**
     * Get monthly ticket counts for a specific client over the last $months.
     *
     * @param User $client
     * @param Carbon $since
     * @return Collection
     */
    public function getMonthlyCountsForClient(User $client, Carbon $since): Collection
    {
        return Ticket::where('client_id', $client->id)
            ->where('created_at', '>=', $since)
            ->selectRaw("DATE_TRUNC('month', created_at) as month, COUNT(*) as count")
            ->groupByRaw("DATE_TRUNC('month', created_at)")
            ->pluck('count', 'month');
    }

    /**
     * Get the total ticket count for a specific client.
     *
     * @param User $client
     * @return int
     */
    public function getTotalTicketsForClient(User $client): int
    {
        return Ticket::where('client_id', $client->id)->count();
    }

    /**
     * Get a breakdown of tickets by priority for a specific client.
     *
     * @param User $client
     * @return Collection
     */
    public function getPriorityBreakdownForClient(User $client): Collection
    {
        return Ticket::where('client_id', $client->id)
            ->selectRaw('priority as label, COUNT(*) as count')
            ->groupBy('priority')
            ->get();
    }
}
