<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVouchersTable extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();  // Link to the business
            $table->string('code')->unique();  // Unique voucher code
            $table->decimal('discount_amount', 10, 2);  // Discount value for the voucher
            $table->dateTime('expiry_date')->nullable();  // Expiry date for the voucher
            $table->boolean('is_used')->default(false);  // To check if the voucher is used
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
}
