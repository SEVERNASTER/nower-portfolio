<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('portfolios', 'template_key')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->string('template_key')->default('classic')->after('is_public');
            });
        }

        if (!Schema::hasColumn('portfolios', 'public_slug')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->string('public_slug')->nullable()->unique()->after('template_key');
            });
        }

        if (!Schema::hasColumn('portfolios', 'review_status')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->string('review_status')->nullable()->after('public_slug');
            });
        }

        if (!Schema::hasColumn('portfolios', 'review_comment')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->text('review_comment')->nullable()->after('review_status');
            });
        }

        if (!Schema::hasColumn('portfolios', 'reviewed_at')) {
            Schema::table('portfolios', function (Blueprint $table) {
                $table->timestamp('reviewed_at')->nullable()->after('review_comment');
            });
        }
    }

    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            if (Schema::hasColumn('portfolios', 'template_key')) {
                $table->dropColumn('template_key');
            }

            if (Schema::hasColumn('portfolios', 'public_slug')) {
                $table->dropColumn('public_slug');
            }

            if (Schema::hasColumn('portfolios', 'review_status')) {
                $table->dropColumn('review_status');
            }

            if (Schema::hasColumn('portfolios', 'review_comment')) {
                $table->dropColumn('review_comment');
            }

            if (Schema::hasColumn('portfolios', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }
        });
    }
};