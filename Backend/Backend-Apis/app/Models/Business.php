<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = ['name','type', 'image', 'opening_time', 'closing_time', 'discount'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        //return secure_url('/be' .$this->image);
        
        return url('' . $this->image);
    }

    public function products() {
        return $this->hasMany(Product::class);
    }

    public function type()
    {
        return $this->type;
    }    

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }
}
