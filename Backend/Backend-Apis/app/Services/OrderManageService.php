<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Events\TestEvent;
use App\Models\Business;
use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use Exception;
use Illuminate\Support\Facades\Log;

class OrderManageService
{
    public function placeOrder()
{
    $cartItems = Cart::where('user_id', auth()->id())->get();

    if ($cartItems->isEmpty()) {
        return response()->json(['message' => 'Your cart is empty'], 200);
    }

    $ordersByBusiness = $cartItems->groupBy(function ($cartItem) {
        return $cartItem->product->business_id;
    });

    $orders = [];
    $failedBusinesses = [];

    foreach ($ordersByBusiness as $businessId => $items) {
        // Calculate total price using final_price if available
        $totalPrice = $items->sum(function ($cartItem) {
            $product = $cartItem->product;
            return ($product->final_price ?? $product->price) * $cartItem->quantity;
        });

        if ($totalPrice < 500) {
            $business = Business::find($businessId);
            $failedBusinesses[] = $business ? $business->name : 'Unknown Restaurant';
        }
    }

    if (count($failedBusinesses) > 0) {
        return response()->json(
            [
                'message' => 'Order(s) cannot be placed. Minimum order amount is 500 rupees for each business.',
                'failed_businesses' => $failedBusinesses,
            ],
            400
        );
    }

    foreach ($ordersByBusiness as $businessId => $items) {
        // Calculate total price using final_price if available
        $totalPrice = $items->sum(function ($cartItem) {
            $product = $cartItem->product;
            return ($product->final_price ?? $product->price) * $cartItem->quantity;
        });

        // Create the order
        $order = Order::create([
            'user_id' => auth()->id(),
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);

        foreach ($items as $cartItem) {
            $product = $cartItem->product;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                // Use final_price if available
                'price' => $product->final_price ?? $product->price,
                'quantity' => $cartItem->quantity,
            ]);

            $cartItem->delete();
        }

        // Dispatch the event
        // OrderPlaced::dispatch($order, $businessId);
        event(new OrderPlaced($order, $businessId));
        $orders[] = $order;
    }

    return response()->json([
        'message' => 'Order(s) placed successfully',
        'orders' => $orders
    ], 200);
}




    public function viewOrders($userId)
    {
        return Order::where('user_id', $userId)->with('items.product')->get();
    }

    public function viewAllOrders()
    {
        return Order::with('items.product', 'user')->get();
    }

    public function viewRestaurantOrders($businessId)
    {
        return Order::whereHas('items.product', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
            ->with('items.product', 'user', 'user.household', 'user.household.town')
            ->get();
    }

    public function updateOrderStatus($orderId, $status)
    {
        $order = Order::findOrFail($orderId);
        $order->status = $status;
        $order->save();

        return $order;
    }
}
