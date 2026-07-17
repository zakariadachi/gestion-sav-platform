<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Enums\TicketStatus;
use Illuminate\Support\Facades\Log;

class TicketService
{
    /**
     * Create a new ticket for a client.
     *
     * @param User $client
     * @param array $data
     * @return Ticket
     */
    public function createTicket(User $client, array $data): Ticket
    {
        $ticket              = new Ticket();
        $ticket->client_id   = $client->id;
        $ticket->title       = $data['title'];
        $ticket->description = $data['description'];
        $ticket->priority    = $data['priority'] ?? 'Medium';
        $ticket->status      = TicketStatus::New;
        $ticket->save();

        Log::info('New ticket created', [
            'ticket_id' => $ticket->id,
            'client_id' => $client->id,
        ]);

        return $ticket;
    }

    /**
     * Assign a technician to a ticket.
     *
     * @param Ticket $ticket
     * @param int $technicianId
     * @return Ticket
     */
    public function assignTechnician(Ticket $ticket, int $technicianId): Ticket
    {
        $ticket->technician_id = $technicianId;
        $ticket->status        = TicketStatus::InProgress;
        $ticket->save();

        Log::info('Technician assigned to ticket', [
            'ticket_id'     => $ticket->id,
            'technician_id' => $technicianId,
        ]);

        return $ticket;
    }

    /**
     * Update the status of a ticket.
     *
     * @param Ticket $ticket
     * @param TicketStatus $status
     * @return Ticket
     */
    public function updateStatus(Ticket $ticket, TicketStatus $status): Ticket
    {
        $oldStatus = $ticket->status;

        $ticket->status = $status;
        $ticket->save();

        Log::info('Ticket status updated', [
            'ticket_id'  => $ticket->id,
            'old_status' => $oldStatus->value ?? $oldStatus,
            'new_status' => $status->value,
        ]);

        return $ticket;
    }

    /**
     * Update a ticket's editable content fields (title, description, priority).
     *
     * Only fields present in $data are updated; absent keys are left untouched.
     * Authorization (Client owns ticket AND status === New) is enforced upstream
     * by TicketPolicy::edit() before this method is called.
     *
     * @param Ticket $ticket
     * @param array  $data  Keys: title?, description?, priority?
     * @return Ticket
     */
    public function updateTicket(Ticket $ticket, array $data): Ticket
    {
        if (isset($data['title']))       $ticket->title       = $data['title'];
        if (isset($data['description'])) $ticket->description = $data['description'];
        if (isset($data['priority']))    $ticket->priority    = $data['priority'];

        $ticket->save();

        Log::info('Ticket content updated', [
            'ticket_id' => $ticket->id,
            'fields'    => array_keys($data),
        ]);

        return $ticket;
    }
}
