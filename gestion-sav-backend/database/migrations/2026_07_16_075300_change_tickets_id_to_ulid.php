<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add Temporary ULID columns
        Schema::table('tickets', function (Blueprint $table) {
            $table->ulid('ulid')->nullable();
        });
        Schema::table('rapports', function (Blueprint $table) {
            $table->ulid('ticket_ulid')->nullable();
        });
        Schema::table('ticket_comments', function (Blueprint $table) {
            $table->ulid('ticket_ulid')->nullable();
        });

        // 2. Backfill existing data with new ULIDs
        $tickets = DB::table('tickets')->get();
        foreach ($tickets as $ticket) {
            $ulid = (string) Str::ulid();
            DB::table('tickets')->where('id', $ticket->id)->update(['ulid' => $ulid]);
            DB::table('rapports')->where('ticket_id', $ticket->id)->update(['ticket_ulid' => $ulid]);
            DB::table('ticket_comments')->where('ticket_id', $ticket->id)->update(['ticket_ulid' => $ulid]);
        }

        // 3. Drop existing foreign keys and unique constraints
        Schema::table('rapports', function (Blueprint $table) {
            $table->dropForeign(['ticket_id']);
            $table->dropUnique(['ticket_id']); // Restoring constraint from 2026_07_11 migration
        });
        Schema::table('ticket_comments', function (Blueprint $table) {
            $table->dropForeign(['ticket_id']);
        });

        // 4. Drop old BigInt columns
        Schema::table('tickets', function (Blueprint $table) { $table->dropColumn('id'); });
        Schema::table('rapports', function (Blueprint $table) { $table->dropColumn('ticket_id'); });
        Schema::table('ticket_comments', function (Blueprint $table) { $table->dropColumn('ticket_id'); });

        // 5. Rename ULID columns to take their place
        Schema::table('tickets', function (Blueprint $table) { $table->renameColumn('ulid', 'id'); });
        Schema::table('rapports', function (Blueprint $table) { $table->renameColumn('ticket_ulid', 'ticket_id'); });
        Schema::table('ticket_comments', function (Blueprint $table) { $table->renameColumn('ticket_ulid', 'ticket_id'); });

        // 6. Re-apply Primary Keys, Foreign Keys, and Constraints
        Schema::table('tickets', function (Blueprint $table) {
            $table->primary('id');
        });
        Schema::table('rapports', function (Blueprint $table) {
            $table->unique('ticket_id');
            $table->foreign('ticket_id')->references('id')->on('tickets')->cascadeOnDelete();
        });
        Schema::table('ticket_comments', function (Blueprint $table) {
            $table->foreign('ticket_id')->references('id')->on('tickets')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        // Down migration is intentionally omitted as reversing a ULID generation 
        // back to sequential integers safely is highly complex and rarely needed.
        throw new \Exception('Irreversible migration. Cannot downgrade ULIDs back to sequential BigInts.');
    }
};
