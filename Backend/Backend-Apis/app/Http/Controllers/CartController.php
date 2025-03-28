<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\Add;
use App\Models\cart;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        return $this->successResponse($cartItem, 'Added to Cart', 201);
    }

    public function viewCart()
    {
        $cartItems = $this->cartService->viewCart();
        return $this->successResponse($cartItems, 'Your cart');
    }

    public function removeCart($id)
    {
        $this->cartService->removeCart($id);
        return $this->successResponse(null, 'Deleted Successfully', 204);
    }

    public function removeProduct($id)
    {
        $cartItem = $this->cartService->removeProduct($id);

        if ($cartItem) {
            return $this->successResponse($cartItem, 'Quantity decreased');
        } else {
            return $this->successResponse(null, 'Product removed from cart');
        }

        return response()->json(['success' => false, 'message' => 'No product found'], 404);
    }

    public function updateQuantity(Request $request, $id)
    {
        $cartItem = $this->cartService->updateQuantity($request->all(), $id);

        if ($cartItem) {
            return $this->successResponse($cartItem, 'Quantity updated');
        }

        return $this->errorResponse('No product found', 404);
    }

    public function getItemCount()
    {
        // Get the total quantity for the authenticated user
        $totalQuantity = cart::where('user_id', Auth::id())->sum('quantity');

        return response()->json(['item_count' => $totalQuantity]);
    }
}
