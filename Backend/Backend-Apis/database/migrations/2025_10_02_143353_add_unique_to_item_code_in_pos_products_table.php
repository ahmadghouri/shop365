<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            // Ensure no null values before altering
            DB::table('pos_products')->whereNull('bar_code')->update(['bar_code' => '']);

            // Change column: make not nullable with default ''
            $table->string('bar_code')->default('')->nullable(false)->change();

            // Add composite unique index
            $table->unique(['item_code', 'bar_code', 'locno'], 'pos_products_unique_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->dropUnique('pos_products_unique_key');
            $table->string('bar_code')->nullable()->change(); // rollback
        });
    }
};
