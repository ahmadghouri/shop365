<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderCompleted extends Controller
{
    public function makeComplete(Request $request, $id)
    {
        $user = $request->user();
        $notfications = $user->notifications()->where("id", $id)->first();
    }
}
