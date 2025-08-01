<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EasyBuy extends Model
{
    protected $fillable = [
        'title',
        'business_id',
        'image',
        'payload'
    ];

    protected $casts = [
        'payload' => 'array'
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return secure_url('/be' . $this->image);
        // return url('' . $this->image);
    }

    // SQLite-specific JSON handling
    public function setPayloadAttribute($value)
    {
        $this->attributes['payload'] = is_array($value)
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : $value;
    }
}
