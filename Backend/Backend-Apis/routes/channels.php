<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Business;



Broadcast::channel('notification', function ($user) {
    return $user;
});


Broadcast::channel('orders.User.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});


Broadcast::channel('business.{businessId}', function ($user, $businessId) {
    return $user->businesses->contains($businessId); 
});
