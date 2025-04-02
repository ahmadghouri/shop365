<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'description', 'image', 'price', 'business_id', 'type', 'status', 'is_active'];

    protected $appends = ['image_url', 'final_price'];

    public function getImageUrlAttribute()
    {
        return secure_url('/be' . $this->image);
        //return url('' . $this->image);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function perscriptions()
    {
        return $this->hasMany(Perscription::class, 'product_id');
    }


    // Product.php
    public function getFinalPriceAttribute()
    {
        $price = $this->price;

        // If a discount is applied, calculate the final price
        if ($this->discount && $this->discount > 0) {
            if ($this->discount_type === 'percentage') {
                // Apply percentage discount
                $price = $this->price - ($this->price * ($this->discount / 100));
            } elseif ($this->discount_type === 'flat') {
                // Apply flat discount
                $price = max(0, $this->price - $this->discount);
            }
        }

        return $price;
    }
}
