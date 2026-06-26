<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    /**
     * Any authenticated user can read articles.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Any authenticated user can read a single article.
     */
    public function view(User $user, Article $article): bool
    {
        return true;
    }

    /**
     * Only admins can create articles.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admins can update articles.
     */
    public function update(User $user, Article $article): bool
    {
        return $user->role === UserRole::Admin;
    }

    /**
     * Only admins can delete articles.
     */
    public function delete(User $user, Article $article): bool
    {
        return $user->role === UserRole::Admin;
    }
}
