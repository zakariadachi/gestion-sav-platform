<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TicketComment;
use App\Models\User;
use App\Enums\UserRole;

class TicketCommentPolicy
{
    /**
     * Determine if the given comment can be updated by the user.
     */
    public function update(User $user, TicketComment $comment): bool
    {
        return $user->id === $comment->user_id;
    }

    /**
     * Determine if the given comment can be deleted by the user.
     */
    public function delete(User $user, TicketComment $comment): bool
    {
        // Users can delete their own comments, Admins can delete any comment.
        return $user->id === $comment->user_id || $user->role === UserRole::Admin->value;
    }
}
