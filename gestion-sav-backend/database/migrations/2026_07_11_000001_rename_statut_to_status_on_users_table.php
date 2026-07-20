<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename the French `statut` column (values: Actif / Inactif) to the
     * English `status` column (values: Active / Inactive) that the entire
     * application codebase already expects.
     *
     * Why raw SQL instead of Schema Builder:
     * Laravel's enum() on PostgreSQL creates a VARCHAR + CHECK constraint.
     * The constraint `users_statut_check` enforces ('Actif','Inactif').
     * Schema::renameColumn() renames the column but leaves the CHECK
     * constraint referencing the old allowed values, which then blocks
     * the UPDATE to 'Active'/'Inactive'.
     * Raw DDL lets us drop the constraint, rename, update data, and add
     * the new constraint — all inside a single atomic transaction.
     */
    public function up(): void
    {
        DB::transaction(function () {
            // 1. Drop the old CHECK constraint that enforces French values.
            DB::statement('ALTER TABLE users DROP CONSTRAINT users_statut_check');

            // 2. Rename the column.
            DB::statement('ALTER TABLE users RENAME COLUMN statut TO status');

            // 3. Migrate existing data values from French to English.
            DB::statement("UPDATE users SET status = 'Active'  WHERE status = 'Actif'");
            DB::statement("UPDATE users SET status = 'Inactive' WHERE status = 'Inactif'");

            // 4. Add the new CHECK constraint with English values.
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('Active', 'Inactive'))");

            // 5. Fix the column default (was left as the old French value).
            DB::statement("ALTER TABLE users ALTER COLUMN status SET DEFAULT 'Active'");
        });
    }

    /**
     * Reverse: restore the French column name, values, and constraint.
     */
    public function down(): void
    {
        DB::transaction(function () {
            DB::statement('ALTER TABLE users DROP CONSTRAINT users_status_check');
            DB::statement("UPDATE users SET status = 'Actif'   WHERE status = 'Active'");
            DB::statement("UPDATE users SET status = 'Inactif' WHERE status = 'Inactive'");
            DB::statement('ALTER TABLE users RENAME COLUMN status TO statut');
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_statut_check CHECK (statut IN ('Actif', 'Inactif'))");
            DB::statement("ALTER TABLE users ALTER COLUMN statut SET DEFAULT 'Actif'");
        });
    }
};
