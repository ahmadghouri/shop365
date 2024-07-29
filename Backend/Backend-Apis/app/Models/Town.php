<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Town extends Model
{
    use HasFactory;

    protected $fillable = ['town_name'];

    public function households(){
        return $this->hasMany(Household::class);
    }

    public function users(){
        return $this->hasMany(User::class);
    }

    public function complaints(){
        return $this->hasMany(Complaint::class);
    }
}
