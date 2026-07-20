<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a UNIQUE constraint on rapports.ticket_id.
     *
     * Why: the application enforces one rapport per ticket via an exists()
     * check in the controller, but that check is not atomic — two concurrent
     * requests can both pass it before either inserts. The database-level
     * UNIQUE constraint is the only reliable guard: the second concurrent
     * INSERT will be rejected by PostgreSQL regardless of timing.
     *
     * The controller catches UniqueConstraintViolationException and returns
     * a 409 response, preserving the existing API contract.
     */
    public function up(): void
    {
        Schema::table('rapports', function (Blueprint $table) {
            $table->unique('ticket_id');
        });
    }

    public function down(): void
    {
        Schema::table('rapports', function (Blueprint $table) {
            $table->dropUnique(['ticket_id']);
        });
    }
};
