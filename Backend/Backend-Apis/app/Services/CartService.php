<?php

namespace App\Services;

use App\Http\Requests\Cart\Add;
use App\Models\cart;
use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;

class CartService
{
    public function add($request)
    {
        // check item exist?

        $cartItem = cart::where('user_id', auth()->id())
                        -> where('product_id', $request["product_id"])
                        ->first();

        if($cartItem){
            $cartItem->quantity += $request["quantity"];
            $cartItem->save();
        } else {
            $cartItem = new cart();
            $cartItem->user_id = auth()->id();
            $cartItem->product_id = $request["product_id"];
            $cartItem->quantity = $request["quantity"];
            $cartItem->save();
        }

        return $cartItem;

    }

}