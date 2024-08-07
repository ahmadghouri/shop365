<?php

namespace App\Http\Controllers;

use App\Events\NotificationEvent;
use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\OrderNotification;
use App\Notifications\RealTimeNotification;
use App\Services\OrderManageService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{

    protected $orderService;

    public function __construct(OrderManageService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function placeOrder()
    {
        $cartItems = Cart::where('user_id', auth()->id())->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => "Your cart is empty"], 200);
        }

        // Initialize $order variable
        $order = Order::create([
            'user_id' => auth()->id(),
            'total_price' => $cartItems->sum(function($cartItem){
                return $cartItem->quantity * $cartItem->product->price;
            })
        ]);

        $user = User::where('role', 'restaurant_admin')->first();
        $user->notify(new OrderNotification( "New Order Placed", $order ));

        broadcast(new NotificationEvent($order));

        foreach ($cartItems as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'price' => $cartItem->product->price,
                'quantity' => $cartItem->quantity
            ]);

            $cartItem->delete();
        }

    
    
        return response()->json(['message' => "Order placed successfully", 'order' => $order], 200);

    }


    public function viewOrders()
    {
        $user = Auth::user();
        $orders = Order::where('user_id', $user->id)
            ->with('items.product')  
            ->get();

        return $this->successResponse($orders, "Your orders");
    }


    public function viewAllOrders()
    {
        $orders = Order::with('items.product', 'user')->get();

        return response()->json(['orders' => $orders], 200);
    }


    public function viewRestaurantOrders()
    {
        $user = Auth::user();
        $restaurantId = $user->business_id; // assuming restaurant_id is a field in the users table

        $orders = Order::whereHas('items.product', function($query) use ($restaurantId) {
            $query->where('business_id', $restaurantId);
        })->with('items.product', 'user', 'user.household', 'user.household.town')->get();

        return response()->json(['orders' => $orders], 200);
    }



    public function updateStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|string|in:pending,preparing,delivered',
    ]);

    try {
        $order = Order::findOrFail($id);

        // Update the order status
        $order->status = $request->status;
        $order->save();

        // Optionally, notify the user or broadcast an event
        // $user = $order->user;
        // $user->notify(new OrderNotification("Order Status Updated", $order));
        // broadcast(new NotificationEvent($order));

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ], 200);

    } catch (Exception $e) {
        return response()->json([
            'message' => 'Order not found or update failed',
            'error' => $e->getMessage()
        ], 404);
    }
}




}

