<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('admin_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('report_type');
            $table->string('filter_status')->default('all');

            $table->unsignedInteger('rows_count')->default(0);

            $table->json('filters')->nullable();
            $table->json('data_snapshot')->nullable();

            $table->timestamp('generated_at');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_histories');
    }
};