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
            $totalPrice = $items->sum(function ($cartItem) {
                return $cartItem->product->price * $cartItem->quantity;
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
            $totalPrice = $items->sum(function ($cartItem) {
                return $cartItem->product->price * $cartItem->quantity;
            });

            $order = Order::create([
                'user_id' => auth()->id(),
                'total_price' => $totalPrice,
                'status' => 'pending',
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

            // OrderPlaced::dispatch($order, $businessId);

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
