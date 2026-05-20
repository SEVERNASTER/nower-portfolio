<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Quitar el CHECK antiguo de status
        DB::statement("
            ALTER TABLE portfolios
            DROP CONSTRAINT IF EXISTS portfolios_status_check
        ");

        // 2. Permitir null en review_status
        DB::statement("
            ALTER TABLE portfolios
            ALTER COLUMN review_status DROP NOT NULL
        ");

        // 3. Quitar default de review_status si existiera
        DB::statement("
            ALTER TABLE portfolios
            ALTER COLUMN review_status DROP DEFAULT
        ");

        // 4. Cambiar default de status
        DB::statement("
            ALTER TABLE portfolios
            ALTER COLUMN status SET DEFAULT 'unpublished'
        ");

        // 5. Convertir los registros viejos draft a unpublished
        DB::table('portfolios')
            ->where('status', 'draft')
            ->update([
                'status' => 'unpublished',
                'is_public' => false,
                'review_status' => null,
                'review_comment' => null,
                'reviewed_at' => null,
            ]);

        // 6. Crear el nuevo CHECK de status
        DB::statement("
            ALTER TABLE portfolios
            ADD CONSTRAINT portfolios_status_check
            CHECK (status IN ('unpublished', 'pending_review', 'published'))
        ");
    }

    public function down(): void
    {
        // 1. Quitar el CHECK nuevo
        DB::statement("
            ALTER TABLE portfolios
            DROP CONSTRAINT IF EXISTS portfolios_status_check
        ");

        // 2. Volver unpublished a draft
        DB::table('portfolios')
            ->where('status', 'unpublished')
            ->update([
                'status' => 'draft',
                'is_public' => false,
                'review_status' => 'pending',
            ]);

        // 3. Volver el default anterior de status
        DB::statement("
            ALTER TABLE portfolios
            ALTER COLUMN status SET DEFAULT 'draft'
        ");

        // 4. Restaurar CHECK anterior
        DB::statement("
            ALTER TABLE portfolios
            ADD CONSTRAINT portfolios_status_check
            CHECK (status IN ('draft', 'pending_review', 'published'))
        ");
    }
};