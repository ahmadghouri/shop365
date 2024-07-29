<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\Add;
use App\Models\cart;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }


    public function addToCart(Add $request)
    {
        $cartItem = $this->cartService->add($request->validated());
    
        return response()->json($cartItem, 201);
    }
    


    public function viewCart() 
    {
        $cartItems = cart::with('product')->where('user_id', auth()->id())->get();
        return $this->successResponse($cartItems, "Your cart");
    }

    public function removeCart($id) {
        $item = cart::where('user_id', auth()->id())->where('id', $id)->firstOrFail();
        $item->delete();
        return $this->successResponse(null,"Deleted Successfully", 204);
    }

    public function removeProduct($id)
    {
        $cartItem = cart::where('user_id', auth()->id())
                        ->where('product_id',$id)
                        ->first();
        if($cartItem)
        {
            $cartItem->quantity -= 1;
            $cartItem->save();
            return $this->successResponse($cartItem,"Quantity Decreased");
        }

        return $this->errorResponse("No product found");
    }
}
