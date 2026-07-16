<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\TicketStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    public function __construct(
        private \App\Services\DashboardService $dashboardService
    ) {}

    public function getStats(Request $request): JsonResponse
    {
        Gate::authorize('viewStats', Ticket::class);
        
        $stats = $this->dashboardService->getAdminStats();

        return response()->json($stats);
    }
}
