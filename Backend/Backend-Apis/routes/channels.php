<?php

use Illuminate\Support\Facades\Broadcast;



Broadcast::channel('notification', function ($user) {
    return $user;
});


Broadcast::channel('notifications.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});