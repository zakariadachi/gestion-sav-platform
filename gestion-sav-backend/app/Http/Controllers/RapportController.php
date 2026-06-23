<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Http\Requests\StoreRapportRequest;
use App\Http\Requests\UpdateRapportRequest;
use App\Http\Resources\RapportResource;
use App\Models\Ticket;
use App\Services\AttachmentService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class RapportController extends Controller
{
    public function store(StoreRapportRequest $request, string $ticket_id, AttachmentService $attachmentService): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticket_id);

        // TicketPolicy::updateStatus allows Admins and the assigned Technician only.
        Gate::authorize('updateStatus', $ticket);

        // Upload photos before the transaction — file I/O cannot be rolled back
        // by the database, so we do it first. If the transaction later fails,
        // the orphaned files are an acceptable trade-off (far better than a
        // partially-committed DB state). Uploaded paths are passed into the
        // transaction closure by reference.
        $paths = [];
        foreach ($request->file('photos', []) as $photo) {
            $paths[] = $attachmentService->upload($photo, 'rapports');
        }

        try {
            $rapport = DB::transaction(function () use ($ticket, $request, $paths) {
                // The UNIQUE constraint on rapports.ticket_id is the true
                // concurrency guard. This exists() check is a fast-path that
                // avoids a constraint exception on the happy path (first request).
                if ($ticket->rapport()->exists()) {
                    // Throw a recognisable exception so the outer catch can
                    // return a 409 without duplicating the response logic.
                    throw new UniqueConstraintViolationException(
                        'pgsql',
                        'INSERT INTO rapports',
                        [],
                        new \Exception('Un rapport existe déjà pour ce ticket.')
                    );
                }

                $rapport = $ticket->rapport()->create([
                    'contenu' => $request->contenu,
                    'photos'  => $paths,
                ]);

                // Both operations must succeed together. If this update fails,
                // the transaction rolls back and the rapport is not persisted.
                $ticket->update(['status' => TicketStatus::Resolved]);

                return $rapport;
            });
        } catch (UniqueConstraintViolationException) {
            // Covers both the explicit throw above (exists() check) and any
            // concurrent INSERT that slips past the exists() check and hits
            // the database-level UNIQUE constraint on ticket_id.
            return response()->json(['message' => 'Un rapport existe déjà pour ce ticket.'], 409);
        }

        return response()->json(new RapportResource($rapport), 201);
    }

    public function show(string $ticket_id): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticket_id);

        // TicketPolicy::view ensures only the owner client, assigned technician, or admin can read.
        Gate::authorize('view', $ticket);

        $rapport = $ticket->rapport()->first();

        if ($rapport === null) {
            return response()->json(['data' => null]);
        }

        return response()->json(new RapportResource($rapport));
    }

    public function update(UpdateRapportRequest $request, string $ticket_id, AttachmentService $attachmentService): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticket_id);
        $rapport = $ticket->rapport()->firstOrFail();

        Gate::authorize('update', $rapport);

        $paths = $rapport->photos ?? [];
        if ($request->hasFile('photos')) {
            // Append new photos
            foreach ($request->file('photos') as $photo) {
                $paths[] = $attachmentService->upload($photo, 'rapports');
            }
        }

        $rapport->update([
            'contenu' => $request->contenu,
            'photos'  => $paths,
        ]);

        return response()->json(new RapportResource($rapport), 200);
    }
}
