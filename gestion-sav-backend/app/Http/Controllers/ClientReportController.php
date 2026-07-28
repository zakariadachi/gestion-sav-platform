<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClientReportController extends Controller
{
    public function __construct(
        private \App\Repositories\TicketRepository $ticketRepository
    ) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewOwnReports', Ticket::class);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $now  = Carbon::now();

        // ── Single aggregated query for monthly counts ──
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();

        $monthlyCountsPivot = $this->ticketRepository->getMonthlyCountsForClient($user, $sixMonthsAgo);
        
        $monthlyCounts = $monthlyCountsPivot->mapWithKeys(fn ($count, $month) => [
            Carbon::parse($month)->format('Y-m') => (int) $count,
        ]);

        // ── Build the 6-month chart arrays from the pivot ──
        $months         = [];
        $ticketsByMonth = [];

        for ($i = 5; $i >= 0; $i--) {
            $date             = $now->copy()->subMonths($i);
            $months[]         = $date->translatedFormat('M');
            $ticketsByMonth[] = $monthlyCounts[$date->format('Y-m')] ?? 0;
        }

        // ── Current and last month counts ──
        $ticketsThisMonth = $monthlyCounts[$now->format('Y-m')] ?? 0;
        $ticketsLastMonth = $monthlyCounts[$now->copy()->subMonth()->format('Y-m')] ?? 0;
        $trend            = $ticketsThisMonth - $ticketsLastMonth;

        // ── Total and priority breakdown ──
        $totalTickets = $this->ticketRepository->getTotalTicketsForClient($user);

        $ticketsByPriority = $this->ticketRepository->getPriorityBreakdownForClient($user)
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Non spécifié',
                'pct'   => $totalTickets > 0 ? round(($item->count / $totalTickets) * 100) : 0,
            ]);

        return response()->json([
            'stats' => [
                [
                    'label'   => 'Tickets créés (Ce mois)',
                    'value'   => (string) $ticketsThisMonth,
                    'trend'   => ($trend >= 0 ? '+' : '') . $trend,
                    'trendUp' => $trend <= 0,
                ],
                [
                    'label'   => 'Total des tickets',
                    'value'   => (string) $totalTickets,
                    'trend'   => '',
                    'trendUp' => true,
                ],
            ],
            'chart' => [
                'months' => $months,
                'data'   => $ticketsByMonth,
            ],
            'breakdown' => $ticketsByPriority,
        ]);
    }
}
