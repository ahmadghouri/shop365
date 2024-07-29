<?php

namespace App\Services;

use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use Exception;

class OrderService
{
    public function placeOrder()
    {
        $cartItems = cart::where('user_id', auth()->id())->get();

        if($cartItems->isEmpty())
        {
            return response()->json(['message' => "Your cart is empty"], 200);
        }

        $order = Order::create([
            'user_id' => auth()->id(),
            'total_price' => $cartItems->sum(function($cartItem){
                return $cartItem->quantity * $cartItem->product->price;
            })
        ]);

        foreach ($cartItems as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'price' => $cartItem->product->price,
                'quantity' => $cartItem->quantity
            ]);

            $cartItem->delete();
        }
    }
}