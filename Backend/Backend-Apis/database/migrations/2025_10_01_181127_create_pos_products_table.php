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
        Schema::create('pos_products', function (Blueprint $table) {
            $table->id();
            $table->string('item_code');        // from ITEM_CODE
            $table->string('bar_code')->default('');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('department')->nullable();
            $table->string('group')->nullable();
            $table->string('supplier')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('discount_price', 10, 2)->default(0);
            $table->decimal('cost', 10, 2)->nullable();
            $table->integer('quantity')->default(0);
            $table->boolean('is_available')->default(false);
            $table->string('uom')->nullable();
            $table->string('pack_desc')->nullable();
            $table->string('image_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->tinyInteger('locno')->default(0); // 0=shop, 1=warehouse
            $table->timestamps();

            // Add composite unique index
            $table->unique(['item_code', 'locno'], 'pos_products_unique_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_products');
    }
};
