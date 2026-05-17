<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('city');
        });

        // Convert json to jsonb to allow GIN indexing in Postgres
        DB::statement('ALTER TABLE projects ALTER COLUMN tags TYPE jsonb USING tags::text::jsonb');
        DB::statement('CREATE INDEX projects_tags_gin ON projects USING GIN (tags)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS projects_tags_gin');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['city']);
        });
    }
};
