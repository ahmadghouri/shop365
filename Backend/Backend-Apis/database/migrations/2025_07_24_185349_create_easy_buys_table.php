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
        Schema::create('easy_buys', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('business_id')->constrained('businesses')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('image')->nullable();
            $table->text('payload');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('easy_buys');
    }
};
