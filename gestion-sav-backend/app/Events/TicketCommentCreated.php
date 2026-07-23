<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\TicketComment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCommentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TicketComment $comment
    ) {}

    /**
     * Broadcast on the private channel for this ticket.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('ticket.' . $this->comment->ticket_id),
        ];
    }

    /**
     * The data payload sent to the frontend via the WebSocket.
     */
    public function broadcastWith(): array
    {
        // Eager-load user so the frontend receives the sender's name and role
        $this->comment->loadMissing('user:id,name,role');

        return [
            'comment' => [
                'id'              => $this->comment->id,
                'ticket_id'       => $this->comment->ticket_id,
                'user_id'         => $this->comment->user_id,
                'message'         => $this->comment->message,
                'attachment_path' => $this->comment->attachment_path,
                'attachment_url'  => $this->comment->attachment_url ?? null,
                'created_at'      => $this->comment->created_at?->toISOString(),
                'updated_at'      => $this->comment->updated_at?->toISOString(),
                'user'            => $this->comment->user ? [
                    'id'   => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'role' => $this->comment->user->role,
                ] : null,
            ],
        ];
    }
}
