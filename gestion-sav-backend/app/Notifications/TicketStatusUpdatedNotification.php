<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TicketStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Ticket $ticket
    ) {}

    /**
     * Delivery channels: persist to DB and push via WebSocket.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Data stored in the `notifications` table (data column).
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'ticket_id'    => $this->ticket->id,
            'ticket_title' => $this->ticket->title,
            'status'       => $this->ticket->status->value,
            'message'      => "Votre ticket #{$this->ticket->id} a été mis à jour : statut « {$this->ticket->status->value} ».",
            'url'          => '/client/ticket/' . $this->ticket->id,
        ];
    }

    /**
     * Data broadcast over the WebSocket private channel.
     * Laravel will dispatch this on channel: App.Models.User.{id}
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'ticket_id'    => $this->ticket->id,
            'ticket_title' => $this->ticket->title,
            'status'       => $this->ticket->status->value,
            'message'      => "Votre ticket #{$this->ticket->id} a été mis à jour : statut « {$this->ticket->status->value} ».",
            'url'          => '/client/ticket/' . $this->ticket->id,
            'created_at'   => now()->toISOString(),
        ]);
    }
}
