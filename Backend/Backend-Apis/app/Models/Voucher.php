<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = ['business_id', 'code', 'discount_amount', 'expiry_date', 'is_used'];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function setCodeAttribute($value)
    {
        $this->attributes['code'] = strtolower($value);
    }
}
