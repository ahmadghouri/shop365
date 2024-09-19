<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'description', 'image', 'price', 'business_id', 'type'];

    protected $appends = ['image_url', 'final_price'];

    public function getImageUrlAttribute()
    {
        // return secure_url('/be' .$this->image);
        return url('' . $this->image);
    }

    public function business(){
        return $this->belongsTo(Business::class);
    }

    public function sizes() {
        return $this->belongsToMany(Size::class)->withPivot('price');
    }

// Product.php
public function getFinalPriceAttribute()
{
    if ($this->discount > 0) {
        return $this->price - ($this->price * ($this->discount / 100));
    }
    return $this->price;
}


    
}
