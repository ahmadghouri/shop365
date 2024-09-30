<?php
namespace App\Services;

use App\Models\cart;
use Illuminate\Support\Facades\Auth;

class CartService
{
    public function add($data)
    {
        // Check if item already exists in the cart
        $cartItem = cart::where('user_id', auth()->id())
            ->where('product_id', $data['product_id'])
            ->first();
    
        if ($cartItem) {
            $cartItem->quantity += $data['quantity'];
            $cartItem->save();
        } else {
            $cartItem = new Cart();
            $cartItem->user_id = auth()->id();
            $cartItem->product_id = $data['product_id'];
            $cartItem->quantity = $data['quantity'];
            $cartItem->save();
        }
    
        return $cartItem;
    }
    

    public function viewCart()
    {
        return cart::with('product')->where('user_id', auth()->id())->get();
    }

    public function removeCart($id)
    {
        $item = cart::where('user_id', auth()->id())->where('id', $id)->firstOrFail();
        $item->delete();
        return null;
    }

    public function removeProduct($id)
    {
        $cartItem = cart::where('user_id', auth()->id())->where('product_id', $id)->first();

        if ($cartItem) {
            if ($cartItem->quantity > 1) {
                $cartItem->quantity -= 1;
                $cartItem->save();
                return $cartItem;
            } else {
                $cartItem->delete();
                return null;
            }
        }

        return null;
    }

    public function updateQuantity($data, $id)
    {
        $cartItem = cart::where('user_id', auth()->id())->where('id', $id)->first();

        if ($cartItem) {
            $cartItem->quantity = $data['quantity'];
            $cartItem->save();
            return $cartItem;
        }

        return null;
    }
}
