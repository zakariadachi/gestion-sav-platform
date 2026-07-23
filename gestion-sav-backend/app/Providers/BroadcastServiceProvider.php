<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        /*
         * Register the broadcasting auth route under the `web` middleware group.
         * This is required for Sanctum SPA cookie authentication — the `web`
         * group loads the session and cookie middleware that Sanctum needs to
         * resolve the authenticated user from the session cookie sent by the
         * React frontend.
         *
         * Using `auth:sanctum` here instead of `web` would require a Bearer
         * token in the Authorization header, which Echo's authorizer does not
         * send by default.
         */
        Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);

        require base_path('routes/channels.php');
    }
}
