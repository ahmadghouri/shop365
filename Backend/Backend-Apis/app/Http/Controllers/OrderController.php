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
    
        // Group cart items by business_id
        $ordersByBusiness = $cartItems->groupBy(function($cartItem) {
            return $cartItem->product->business_id; // assuming business_id is a field in products table
        });
    
        $orders = [];
    
        foreach ($ordersByBusiness as $businessId => $items) {
            // Create order for each business
            $order = Order::create([
                'user_id' => auth()->id(),
                'business_id' => $businessId, // Assuming business_id is stored in orders table
                'total_price' => $items->sum(function($cartItem) {
                    return $cartItem->quantity * $cartItem->product->price;
                })
            ]);
    
            foreach ($items as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'price' => $cartItem->product->price,
                    'quantity' => $cartItem->quantity
                ]);
    
                $cartItem->delete();
            }
    
            // Store the order details
            $orders[] = $order;
        }
    
        // Optionally, you can handle notifications or other logic here
    
        return response()->json(['message' => "Order(s) placed successfully", 'orders' => $orders], 200);
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
        $businessId = $user->business_id; // Assuming business_id is correctly set in the User model
    
       
    
        $orders = Order::whereHas('items.product', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
        ->with('items.product', 'user', 'user.household', 'user.household.town')
        ->get();
    
        
    
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

