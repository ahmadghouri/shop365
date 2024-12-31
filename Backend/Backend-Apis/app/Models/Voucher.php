<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $fillable = ['business_id', 'code', 'discount_amount', 'expiry_date', 'is_used', 'min_purchase_amount'];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function setCodeAttribute($value)
    {
        $this->attributes['code'] = strtolower($value);
    }
}
