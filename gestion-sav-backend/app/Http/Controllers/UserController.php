<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\TicketStatus;
use App\Http\Resources\UserResource;
use App\Mail\WelcomeMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function indexTechnicians(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $techniciens = User::where('role', UserRole::Technician->value)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $techniciens]);
    }

    public function indexTeam(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        $team = User::whereIn('role', [UserRole::Admin->value, UserRole::Technician->value])
            ->withCount([
                'technicianTickets as tickets_total',
                'technicianTickets as tickets_resolus' => function ($query) {
                    $query->where('status', TicketStatus::Resolved->value);
                },
            ])
            ->orderBy('name')
            ->paginate(15);

        return UserResource::collection($team);
    }

    public function indexClients(): AnonymousResourceCollection
    {
        Gate::authorize('viewClients', User::class);

        $clients = User::where('role', UserRole::Client->value)
            ->withCount([
                'clientTickets as openTickets' => function ($query) {
                    $query->where('status', '!=', TicketStatus::Resolved->value);
                },
                'clientTickets as resolvedTickets' => function ($query) {
                    $query->where('status', TicketStatus::Resolved->value);
                },
            ])
            ->orderBy('name')
            ->paginate(15);

        return UserResource::collection($clients);
    }

    /**
     * Create a new user with a secure random temporary password.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $validated         = $request->validated();
        $temporaryPassword = Str::random(12);

        $newUser           = new User();
        $newUser->name     = $validated['name'];
        $newUser->email    = $validated['email'];
        $newUser->password = Hash::make($temporaryPassword);
        $newUser->role     = $validated['role'];
        $newUser->status   = $validated['status'];
        $newUser->phone    = $validated['phone'] ?? null;
        $newUser->company  = $validated['company'] ?? null;
        $newUser->save();

        Mail::to($newUser->email)->send(new WelcomeMail($newUser, $temporaryPassword));

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'data'    => new UserResource($newUser),
        ], 201);
    }

    /**
     * Update an existing user's profile (admin only).
     *
     * Authorization is checked BEFORE findOrFail to prevent leaking resource
     * existence via a 404 response to unauthorized callers (IDOR prevention).
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        // Authorize first — unauthorized callers receive 403 before any DB query.
        // We pass a new User instance as a stand-in for the model-level policy check;
        // UserPolicy::update only inspects the acting user's role (Admin), not the target.
        Gate::authorize('update', new User());

        $targetUser = User::findOrFail($id);

        $validated = $request->validated();

        if (isset($validated['name']))   $targetUser->name   = $validated['name'];
        if (isset($validated['email']))  $targetUser->email  = $validated['email'];
        if (isset($validated['role']))   $targetUser->role   = $validated['role'];
        if (isset($validated['status'])) $targetUser->status = $validated['status'];
        if (array_key_exists('phone', $validated))   $targetUser->phone   = $validated['phone'];
        if (array_key_exists('company', $validated)) $targetUser->company = $validated['company'];

        $targetUser->save();

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'data'    => new UserResource($targetUser),
        ]);
    }

    /**
     * Delete a user (soft delete).
     *
     * Authorized via UserPolicy::delete() — only admins.
     * Prevents an admin from deleting themselves.
     */
    public function destroy(int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);

        Gate::authorize('delete', $targetUser);

        if (auth()->id() === $targetUser->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
            ], 403);
        }

        $targetUser->delete(); // Soft delete

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
