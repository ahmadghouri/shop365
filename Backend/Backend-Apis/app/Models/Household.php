<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    use HasFactory;

    protected $fillable = ['address', 'town_id'];

    public function town(){
        return $this->belongsTo(Town::class);
    }

    public function users(){
        return $this->hasMany(User::class);
    }
}
