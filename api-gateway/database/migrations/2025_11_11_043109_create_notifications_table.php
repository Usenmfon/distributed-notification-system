<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id')->unique();
            $table->uuid('user_id')->nullable();
            $table->string('notification_type');
            $table->string('template_code')->nullable();
            $table->jsonb('variables')->nullable();
            $table->integer('priority')->default(5);
            $table->jsonb('metadata')->nullable();
            $table->string('status')->default('pending');
            $table->integer('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
