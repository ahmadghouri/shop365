<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = ['name','type', 'image', 'opening_time', 'closing_time'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return url('/be' . $this->image);
    }

    public function products() {
        return $this->hasMany(Product::class);
    }
}
