<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perscription extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'order_id', 'product_id', 'image_url', 'description', 'status'];
    protected $appends = ['full_image_url'];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function getFullImageUrlAttribute()
    {
        // return secure_url('/be' . $this->image_url);

        return url('' . $this->image_url);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

}
