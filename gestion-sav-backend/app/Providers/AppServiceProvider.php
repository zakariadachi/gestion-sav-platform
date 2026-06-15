<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Article;
use App\Models\Ticket;
use App\Models\User;
use App\Policies\ArticlePolicy;
use App\Policies\TicketPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // ── Auth URL Configuration ─────────────────────────────────────────────
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });
        \Illuminate\Auth\Notifications\VerifyEmail::createUrlUsing(function (object $notifiable) {
            $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                \Illuminate\Support\Carbon::now()->addMinutes(\Illuminate\Support\Facades\Config::get('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
            return config('app.frontend_url')."/verify-email?verify_url=".urlencode($url);
        });
        // ── Policy Registration ──────────────────────────────────────────────
        Gate::policy(Ticket::class,  TicketPolicy::class);
        Gate::policy(Article::class, ArticlePolicy::class);
        Gate::policy(User::class,    UserPolicy::class);

        // ── Rate Limiters ────────────────────────────────────────────────────

        // Global API rate limit: 60 requests/minute per authenticated user or IP
        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Login brute-force protection: 5 attempts/minute per email+IP combination
        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(5)
                ->by($request->input('email') . '|' . $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de tentatives de connexion. Réessayez dans une minute.',
                    ], 429);
                });
        });

        // Registration spam protection: 3 accounts/hour per IP
        RateLimiter::for('register', function (Request $request): Limit {
            return Limit::perHour(3)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de comptes créés depuis cette adresse. Réessayez plus tard.',
                    ], 429);
                });
        });

        // Throttle for heavy endpoints (ticket creation / profile update)
        RateLimiter::for('ticket-creation', function (Request $request): Limit {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Veuillez patienter avant de soumettre une nouvelle requête.',
                    ], 429);
                });
        });

        // Throttle for password reset requests
        RateLimiter::for('password-reset', function (Request $request): Limit {
            return Limit::perMinute(3)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de requêtes. Veuillez patienter avant de réessayer.',
                    ], 429);
                });
        });

        // Throttle for forgot password requests
        RateLimiter::for('forgot-password', function (Request $request): Limit {
            return Limit::perMinute(3)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de requêtes. Veuillez patienter avant de réessayer.',
                    ], 429);
                });
        });

        // Throttle for email verification requests
        RateLimiter::for('verification', function (Request $request): Limit {
            return Limit::perMinute(3)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de requêtes. Veuillez patienter avant de réessayer.',
                    ], 429);
                });
        });
    }
}
