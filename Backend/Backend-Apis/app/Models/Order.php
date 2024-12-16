<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'total_price', 'status', 'voucher_id'];

    public function user() 
    {
        return $this->belongsTo(User::class);
    }

    public function items()  // This must match the name used in the query
    {
         return $this->hasMany(OrderItem::class);
    }
    
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    
}
