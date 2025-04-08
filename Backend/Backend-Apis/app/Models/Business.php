<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'image', 'opening_time', 'closing_time', 'discount', 'parent_id'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return secure_url('/be' . $this->image);

        //return url('' . $this->image);
    }

    public function products()
    {
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

    public function parent()
    {
        return $this->belongsTo(Business::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Business::class, 'parent_id');
    }

    public function getAllBusinessIds()
    {
        $childIds = $this->children()->pluck('id')->toArray();
        return array_merge([$this->id], $childIds);
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }
}
