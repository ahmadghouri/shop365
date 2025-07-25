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

    // SQLite-specific JSON handling
    public function setPayloadAttribute($value)
    {
        $this->attributes['payload'] = is_array($value)
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : $value;
    }
}
