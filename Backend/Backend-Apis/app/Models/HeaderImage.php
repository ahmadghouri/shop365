<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeaderImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image_path',
        'order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer'
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return url('/storage/' . $this->image_path);
    }
}
