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
        // Enums
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_type') THEN CREATE TYPE experience_type AS ENUM ('work', 'academic'); END IF; END $$;");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_type') THEN CREATE TYPE skill_type AS ENUM ('technical', 'soft'); END IF; END $$;");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'portfolio_status') THEN CREATE TYPE portfolio_status AS ENUM ('draft', 'published', 'pending_approval'); END IF; END $$;");

        // Projects Table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->text('evidence_url')->nullable();
            $table->timestamps();
        });

        // Skills Table
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('type', ['technical', 'soft']);
            $table->integer('proficiency_level')->unsigned()->default(1); // 1-5
            $table->timestamps();
        });

        // Experience Table
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['work', 'academic']);
            $table->string('title', 200);
            $table->string('institution', 200);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Social Links Table
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('platform_name', 50);
            $table->text('url');
            $table->timestamps();
        });

        // Portfolios Table
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['draft', 'published', 'pending_approval'])->default('draft');
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolios');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('projects');

        DB::statement('DROP TYPE IF EXISTS portfolio_status');
        DB::statement('DROP TYPE IF EXISTS skill_type');
        DB::statement('DROP TYPE IF EXISTS experience_type');
    }
};
