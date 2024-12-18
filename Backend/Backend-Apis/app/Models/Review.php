<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'business_id', 'order_id', 'rating', 'comments', 'reply'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }


    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public static function getAvgReview($business_id)
    {
        return self::where('business_id', $business_id)->avg('rating');
    }

}
