<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {

            $table->enum('review_status', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');

            $table->text('review_comment')->nullable();

            $table->timestamp('reviewed_at')->nullable();

        });
    }

    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {

            $table->dropColumn([
                'review_status',
                'review_comment',
                'reviewed_at'
            ]);

        });
    }
};