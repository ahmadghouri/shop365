<?php

namespace App\Services;

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

        // Group cart items by business_id
        $ordersByBusiness = $cartItems->groupBy(function ($cartItem) {
            return $cartItem->product->business_id;
        });

        $orders = [];
        $failedBusinesses = [];

        foreach ($ordersByBusiness as $businessId => $items) {
            $totalPrice = $items->sum(function ($cartItem) {
                return $cartItem->product->price * $cartItem->quantity;
            });

            Log::info("Processing businessId: $businessId, TotalPrice: $totalPrice");

            if ($totalPrice >= 500) {
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'business_id' => $businessId,
                    'total_price' => $totalPrice,
                ]);

                foreach ($items as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $cartItem->product_id,
                        'price' => $cartItem->product->price,
                        'quantity' => $cartItem->quantity,
                    ]);

                    $cartItem->delete();
                }

                // Store the order details
                $orders[] = $order;
            } else {
                $business = Business::find($businessId); // Fetch the business name
                $failedBusinesses[] = $business ? $business->name : 'Unknown Restaurant';
            }
        }

        if (count($failedBusinesses) > 0) {
            return response()->json(
                [
                    'message' => 'Order(s) cannot be placed. Minimum order amount is 500 rupees.',
                    'failed_businesses' => $failedBusinesses,
                ],
                400,
            );
        }

        return response()->json(['message' => 'Order(s) placed successfully', 'orders' => $orders], 200);
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
