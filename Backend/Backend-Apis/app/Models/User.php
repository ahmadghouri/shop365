<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    const ROLE_ADMIN = 'restaurant_admin';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'phone_no',
        'password',
        'role',
        'household_id'
    ];

    public function household(){
        return $this->belongsTo(Household::class);
    }

    public function complaints(){
        return $this->hasMany(Complaint::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function cart()
    {
        return $this->hasMany(cart::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
        

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function receivesBroadcastNotificationsOn(): string
    {
        return 'notifications.'.$this->id;
    }
    
}
