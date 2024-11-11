<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroceryProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'grocery_products'; // Ensure this points to your grocery_products table

    protected $fillable = [
        'title',
        'description',
        'type',
        'price',
        'image',
        'business_id',
    ];

    // Specify which fields should be cast to a different data type, if necessary
    protected $casts = [
        'price' => 'float',
    ];
}
