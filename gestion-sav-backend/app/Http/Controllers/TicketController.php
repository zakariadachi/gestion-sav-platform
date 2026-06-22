<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AssignTechnicienRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateStatusRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\TicketStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    public function __construct(
        private \App\Repositories\TicketRepository $ticketRepository,
        private \App\Services\TicketService $ticketService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = auth()->user();

        $tickets = $this->ticketRepository->getTicketsForUser($user, [
            'search'   => $request->query('search'),
            'status'   => $request->query('status'),
            'priority' => $request->query('priority'),
        ]);

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        Gate::authorize('create', Ticket::class);

        /** @var User $user */
        $user = auth()->user();

        $ticket = $this->ticketService->createTicket($user, $request->validated());

        return response()->json(
            new TicketResource($ticket->load(['client:id,name', 'technician:id,name'])),
            201
        );
    }

    public function show(string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('view', $ticket);

        $ticket->load(['client:id,name', 'technician:id,name']);

        return response()->json(new TicketResource($ticket));
    }

    /**
     * Update a ticket's editable fields (title, description, priority).
     *
     * Authorized via TicketPolicy::edit() — clients may only edit their
     * own ticket while its status is still 'New'.
     */
    public function update(UpdateTicketRequest $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('edit', $ticket);

        $ticket = $this->ticketService->updateTicket($ticket, $request->validated());

        return response()->json(
            new TicketResource($ticket->load(['client:id,name', 'technician:id,name']))
        );
    }

    /**
     * Delete a ticket (soft delete).
     *
     * Authorized via TicketPolicy::delete() — only admins.
     */
    public function destroy(string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('delete', $ticket);

        $ticket->delete(); // Soft delete

        return response()->json(['message' => 'Ticket supprimé avec succès.']);
    }

    public function assignTechnicien(AssignTechnicienRequest $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('assign', $ticket);

        $ticket = $this->ticketService->assignTechnician($ticket, (int) $request->technician_id);

        return response()->json(new TicketResource($ticket->load(['client:id,name', 'technician:id,name'])));
    }

    public function updateStatus(UpdateStatusRequest $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('updateStatus', $ticket);

        // Ensure status is cast to enum if it isn't already, although FormRequest handles string validation,
        // we can safely cast it because it's guaranteed to be a valid TicketStatus value.
        $status = TicketStatus::from($request->status);

        $ticket = $this->ticketService->updateStatus($ticket, $status);

        return response()->json(new TicketResource($ticket->load(['client:id,name', 'technician:id,name'])));
    }

    public function reopen(string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('reopen', $ticket);

        $ticket = $this->ticketService->updateStatus($ticket, TicketStatus::InProgress);

        return response()->json(new TicketResource($ticket->load(['client:id,name', 'technician:id,name'])));
    }

    public function rate(Request $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        Gate::authorize('rate', $ticket);

        $validated = $request->validate([
            'rating'   => ['required', 'integer', 'min:1', 'max:5'],
            'feedback' => ['nullable', 'string', 'max:500'],
        ]);

        $ticket->rating = $validated['rating'];
        $ticket->feedback = $validated['feedback'] ?? null;
        $ticket->save();

        return response()->json(new TicketResource($ticket->load(['client:id,name', 'technician:id,name'])));
    }
}
