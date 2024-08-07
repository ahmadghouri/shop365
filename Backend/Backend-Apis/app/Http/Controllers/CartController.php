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
    $cartItem = Cart::where('user_id', auth()->id())
                    ->where('product_id', $id)
                    ->first();
                    
    if ($cartItem) {
        if ($cartItem->quantity > 1) {
            $cartItem->quantity -= 1;
            $cartItem->save();
            return response()->json(['success' => true, 'data' => $cartItem, 'message' => 'Quantity decreased']);
        } else {
            $cartItem->delete(); // Remove the item if quantity is 1
            return response()->json(['success' => true, 'message' => 'Product removed from cart']);
        }
    }

    return response()->json(['success' => false, 'message' => 'No product found'], 404);
}


public function updateQuantity(Request $request, $id)
{
    $cartItem = Cart::where('user_id', auth()->id())
                    ->where('id', $id)
                    ->first();

    if ($cartItem) {
        $quantity = $request->input('quantity');
        $cartItem->quantity = $quantity;
        $cartItem->save();
        return response()->json([
            'success' => true,
            'message' => 'Quantity updated',
            'data' => $cartItem
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'No product found'
    ], 404);
}
}
