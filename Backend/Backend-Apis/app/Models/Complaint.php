<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'user_id', 'household_id', 'town_id' ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function household(){
        return $this->belongsTo(Household::class);
    }

    public function town(){
        return $this->belongsTo(Town::class);
    }
}
