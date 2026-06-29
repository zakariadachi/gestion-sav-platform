<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\TicketCommentCreated;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Services\AttachmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class TicketCommentController extends Controller
{
    /**
     * List comments for a given ticket, paginated.
     *
     * Returns 50 comments per page ordered oldest-first (chronological chat order).
     * The frontend reads response.data.data so the paginator shape is compatible.
     */
    public function index(string $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        Gate::authorize('view', $ticket);

        $comments = $ticket->comments()
            ->with('user:id,name,role')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($comments);
    }

    /**
     * Store a new comment on a ticket.
     */
    public function store(StoreCommentRequest $request, string $ticketId, AttachmentService $attachmentService): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user   = auth()->user();
        $ticket = Ticket::findOrFail($ticketId);

        // TicketPolicy::update: Admins always, Technicians on assigned tickets,
        // Clients on their own tickets.
        Gate::authorize('update', $ticket);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $attachmentService->upload($request->file('attachment'), 'attachments');
        }

        $comment                  = new TicketComment();
        $comment->ticket_id       = $ticket->id;
        $comment->user_id         = $user->id;
        $comment->message         = $request->validated()['message'];
        $comment->attachment_path = $attachmentPath;
        $comment->save();

        $comment->load('user:id,name,role');

        broadcast(new TicketCommentCreated($comment));

        return response()->json(['data' => $comment], 201);
    }

    /**
     * Update an existing comment.
     */
    public function update(Request $request, string $ticketId, string $commentId): JsonResponse
    {
        $comment = TicketComment::where('ticket_id', $ticketId)->findOrFail($commentId);

        Gate::authorize('update', $comment);

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $comment->message = $validated['message'];
        $comment->save();

        // Optionally broadcast an update event here if needed

        return response()->json(['data' => $comment], 200);
    }

    /**
     * Delete an existing comment.
     */
    public function destroy(string $ticketId, string $commentId): JsonResponse
    {
        $comment = TicketComment::where('ticket_id', $ticketId)->findOrFail($commentId);

        Gate::authorize('delete', $comment);

        $comment->delete();

        // Optionally broadcast a delete event here if needed

        return response()->json(['message' => 'Comment deleted successfully'], 200);
    }
}
