<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PasswordResetController;

// ── Public routes ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware('throttle:forgot-password');
Route::post('/reset-password',  [PasswordResetController::class, 'reset'])->middleware('throttle:password-reset');

use App\Http\Controllers\VerificationController;

// ── Protected routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profile
    Route::get('/user',    fn () => new UserResource(auth()->user()));
    Route::post('/logout', [AuthController::class, 'logout']);
    // Email Verification Routes
    Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [VerificationController::class, 'resend'])
        ->middleware(['throttle:6,1'])
        ->name('verification.send');

    // ── Routes Requiring Email Verification ──────────────────────────────────
    Route::middleware('verified')->group(function () {
        Route::post('/profile', [ProfileController::class, 'update'])->middleware('throttle:ticket-creation');

        // Tickets — accessible by all authenticated roles (scoping is done in the controller)
        Route::get('/tickets',      [TicketController::class, 'index']);
        Route::get('/tickets/{id}', [TicketController::class, 'show']);

        // Tickets — Client only
        Route::middleware('role:Client')->group(function () {
            Route::post('/tickets',        [TicketController::class, 'store'])
                ->middleware('throttle:ticket-creation');
            Route::put('/tickets/{id}',    [TicketController::class, 'update'])
                ->middleware('throttle:ticket-creation');
            Route::post('/tickets/{id}/reopen', [TicketController::class, 'reopen'])
                ->middleware('throttle:ticket-creation');
            Route::post('/tickets/{id}/rate', [TicketController::class, 'rate'])
                ->middleware('throttle:ticket-creation');
        });

        // Tickets — Admin only
        Route::middleware('role:Admin')->group(function () {
            Route::patch('/tickets/{id}/assign', [TicketController::class, 'assignTechnicien']);
            Route::delete('/tickets/{id}',       [TicketController::class, 'destroy']);
        });

        // Tickets — Technician only
        Route::middleware('role:Technician')->group(function () {
            Route::patch('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
        });

        // Rapports — throttled to prevent spam/brute-force attempts
        Route::post('/tickets/{ticket_id}/rapport', [RapportController::class, 'store'])
            ->middleware('throttle:ticket-creation');
        Route::put('/tickets/{ticket_id}/rapport', [RapportController::class, 'update'])
            ->middleware('throttle:ticket-creation');
        Route::get('/tickets/{ticket_id}/rapport',  [RapportController::class, 'show'])
            ->middleware('throttle:api');

        // Comments / Ticket messaging — throttled to prevent comment flooding
        Route::get('/tickets/{ticket_id}/comments',  [App\Http\Controllers\TicketCommentController::class, 'index']);
        Route::post('/tickets/{ticket_id}/comments', [App\Http\Controllers\TicketCommentController::class, 'store'])
            ->middleware('throttle:ticket-creation');
        Route::put('/tickets/{ticket_id}/comments/{id}', [App\Http\Controllers\TicketCommentController::class, 'update'])
            ->middleware('throttle:ticket-creation');
        Route::delete('/tickets/{ticket_id}/comments/{id}', [App\Http\Controllers\TicketCommentController::class, 'destroy']);

        // Admin routes
        Route::middleware('role:Admin')->group(function () {
            Route::get('/technicians',    [UserController::class, 'indexTechnicians']);
            Route::get('/users/team',     [UserController::class, 'indexTeam']);
            Route::post('/users',         [UserController::class, 'store']);
            Route::put('/users/{id}',     [UserController::class, 'update']);
            Route::delete('/users/{id}',  [UserController::class, 'destroy']);
            Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

            // Knowledge Base CRUD (Admin only)
            Route::post('/articles',         [App\Http\Controllers\ArticleController::class, 'store']);
            Route::put('/articles/{id}',     [App\Http\Controllers\ArticleController::class, 'update']);
            Route::delete('/articles/{id}',  [App\Http\Controllers\ArticleController::class, 'destroy']);
        });

        // Admin & Technician routes
        Route::middleware('role:Admin,Technician')->group(function () {
            Route::get('/users/clients', [UserController::class, 'indexClients']);
        });

        // Knowledge Base — read access for all authenticated users
        Route::get('/articles', [App\Http\Controllers\ArticleController::class, 'index']);
        Route::get('/articles/{id}', [App\Http\Controllers\ArticleController::class, 'show']);

        // Client reports
        Route::get('/client/reports', [App\Http\Controllers\ClientReportController::class, 'index']);

        // ── In-App Notifications ──────────────────────────────────────────────────
        Route::get('/notifications',                          [App\Http\Controllers\NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read',             [App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/mark-all-read',          [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    });
});
