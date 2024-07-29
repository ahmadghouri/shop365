<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'description', 'image', 'price', 'bussiness_id'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return url('' . $this->image);
    }

    public function business(){
        return $this->belongsTo(Business::class);
    }
}
