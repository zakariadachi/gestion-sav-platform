<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\TicketStatus;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * Get aggregate statistics for the admin dashboard.
     * Caches the results to optimize performance.
     *
     * @return array
     */
    public function getAdminStats(): array
    {
        return Cache::remember('dashboard_stats', 300, function () {
            $ticketsByStatus = Ticket::selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $performanceTechniciens = User::where('role', UserRole::Technician->value)
                ->select('id', 'name')
                ->withCount([
                    'technicianTickets as total_tickets',
                    'technicianTickets as tickets_en_cours' => fn ($q) => $q->where('status', TicketStatus::InProgress->value),
                    'technicianTickets as tickets_resolus'  => fn ($q) => $q->where('status', TicketStatus::Resolved->value),
                ])
                ->orderByDesc('total_tickets')
                ->get()
                ->toArray();

            $alerts = Ticket::where(function ($query) {
                $query->where('status', TicketStatus::New->value)
                      ->where('priority', 'Critical');
            })
            ->orWhereNull('technician_id')
            ->select('id', 'title', 'priority', 'status', 'created_at')
            ->with('client:id,name')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->toArray();

            $averageCsat = (float) (Ticket::whereNotNull('rating')->avg('rating') ?? 0);
            $averageCsat = round($averageCsat, 1);

            $recentFeedbacks = Ticket::whereNotNull('rating')
                ->whereNotNull('feedback')
                ->select('id', 'rating', 'feedback', 'client_id', 'updated_at')
                ->with('client:id,name')
                ->orderByDesc('updated_at')
                ->take(5)
                ->get()
                ->toArray();

            return [
                'total_tickets'           => Ticket::count(),
                'tickets_by_status'       => [
                    'New'         => $ticketsByStatus[TicketStatus::New->value]         ?? 0,
                    'In_Progress' => $ticketsByStatus[TicketStatus::InProgress->value]  ?? 0,
                    'Resolved'    => $ticketsByStatus[TicketStatus::Resolved->value]    ?? 0,
                ],
                'performance_techniciens' => $performanceTechniciens,
                'alerts'                  => $alerts,
                'average_csat'            => $averageCsat,
                'recent_feedbacks'        => $recentFeedbacks,
            ];
        });
    }
}
