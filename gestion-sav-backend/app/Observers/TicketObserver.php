<?php

namespace App\Observers;

use App\Models\Ticket;
use App\Mail\TicketAssigned;
use App\Mail\TicketStatusUpdated;
use App\Notifications\TicketStatusUpdatedNotification;
use App\Enums\TicketStatus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class TicketObserver
{
    public function creating(Ticket $ticket): void
    {
        // Calculate due_date automatically if not provided
        if (!$ticket->due_date) {
            $hours = match ($ticket->priority) {
                'Critical' => 4,
                'High' => 24,
                'Medium' => 48,
                'Low' => 72,
                default => 48,
            };
            
            $ticket->due_date = Carbon::now()->addHours($hours);
        }
    }

    public function created(Ticket $ticket): void
    {
        Cache::forget('dashboard_stats');
    }

    public function updated(Ticket $ticket): void
    {
        Cache::forget('dashboard_stats');

        // Eager-load both relationships in a single query to avoid N+1
        $ticket->loadMissing(['technician:id,email', 'client:id,email']);

        // 1. If technician is newly assigned or changed
        if ($ticket->wasChanged('technician_id') && $ticket->technician_id !== null) {
            $technician = $ticket->technician;
            if ($technician && $technician->email) {
                Mail::to($technician->email)->queue(new TicketAssigned($ticket));
            }
        }

        // 2. Notify client whenever ticket status changes (in-app + email on Resolved)
        if ($ticket->wasChanged('status')) {
            $client = $ticket->client;
            if ($client) {
                // In-app + broadcast notification for every status change
                $client->notify(new TicketStatusUpdatedNotification($ticket));

                // Email only when ticket reaches the final Resolved state
                if ($ticket->status === TicketStatus::Resolved && $client->email) {
                    Mail::to($client->email)->queue(new TicketStatusUpdated($ticket));
                }
            }
        }
    }

    public function deleted(Ticket $ticket): void
    {
        Cache::forget('dashboard_stats');
    }
}
