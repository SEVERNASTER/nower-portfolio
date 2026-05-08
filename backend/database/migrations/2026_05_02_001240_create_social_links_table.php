<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('social_links')) {
            Schema::create('social_links', function (Blueprint $table) {
                $table->id();

                $table->foreignId('user_id')
                    ->constrained()
                    ->onDelete('cascade');

                $table->string('platform_name', 50);
                $table->string('url', 255);

                $table->timestamps();

                $table->unique(['user_id', 'platform_name']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};