<?php

namespace App\Http\Controllers;

use App\Events\TestEvent;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\cart;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderManageService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderManageService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function reorder(Order $order)
{
    $user = Auth::user();

    // Ensure the order belongs to the logged-in user
    if ($order->user_id !== $user->id) {
        return response()->json(['message' => 'You are not authorized to reorder this order'], 403);
    }

    $totalAdded = 0;
    // Loop through the order items and add them to the cart
    foreach ($order->items as $orderItem) {
        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $orderItem->product_id)
            ->first();

        if ($cartItem) {
            // Update the quantity if the item already exists in the cart
            $cartItem->quantity += $orderItem->quantity;
            $cartItem->save();
        } else {
            // Create a new cart item
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $orderItem->product_id,
                'quantity' => $orderItem->quantity,
            ]);
        }
        $totalAdded += $orderItem->quantity;
    }

    return response()->json([
        'message' => 'Order items added to the cart successfully',
        'count' => $totalAdded, // Return the total count of items added
    ]);
}

    public function show($id)
    {
        $order = Order::with([
            'user', 
            'user.household', 
            'user.household.town', 
            'Items', 
            'Items.product'
        ])->findOrFail($id);

        return response()->json($order);
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'userPoints' => 'nullable|boolean',
            'voucher_code' => 'nullable|string', 
        ]);
        $userPoints = $request->input('userPoints', false);
        $voucherCode = $request->input('voucher_code', null);
        return $this->orderService->placeOrder($userPoints, $voucherCode);
    }

    public function viewOrders()
    {
        $userId = Auth::id();
        $orders = $this->orderService->viewOrders($userId);
        return $this->successResponse($orders,'Orders', 200);
    }

    public function viewAllOrders()
    {
        $orders = $this->orderService->viewAllOrders();
        return $this->successResponse($orders,'All orders', 200);
    }

    public function viewRestaurantOrders()
    {
        $businessId = Auth::user()->business_id;
    
        // Fetch paginated orders
        $orders = $this->orderService->viewRestaurantOrders($businessId, request()->get('page', 1));
    
        // Structure response
        $data = [
            'orders' => $orders->items(), // Current page's orders
            'business_id' => $businessId, 
            'pagination' => [
                'total' => $orders->total(), // Total number of orders
                'per_page' => $orders->perPage(), // Orders per page (30 here)
                'current_page' => $orders->currentPage(), // Current page
                'last_page' => $orders->lastPage(), // Last page number
            ],
        ];
    
        return $this->successResponse($data, "Restaurant Orders", 200);
    }
    



    public function superAdminOrders($businessId) 
    {
        $orders = $this->orderService->viewRestaurantOrdersAdmin($businessId);
        $data = array_merge(['orders' => $orders], ['business_id' => $businessId]);
    
        return $this->successResponse($data, "Restaurant Orders", 200);
    }

    // return the only users who places order on the grocery
public function getGroceryOrders($businessId)
{
    return User::whereHas('orders.items.product', function ($query) use ($businessId) {
        $query->where('business_id', $businessId);
    })
    ->with(['household:id,address,town_id', 'household.town:id,town_name']) // Include related household and town
    ->select(['id', 'name', 'phone_no', 'points', 'household_id', 'town_id']) // Select user-specific fields
    ->addSelect([
        'order_count' => Order::selectRaw('count(*)')
            ->whereHas('items.product', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })
            ->whereColumn('orders.user_id', 'users.id')
    ])
    ->get();
}
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
        'status' => 'required|string|in:pending,preparing,delivered,cancelled',
        ]);


        try {
            $order = $this->orderService->updateOrderStatus($id, $request->status);

            return $this->successResponse($order,"Order status updated successfully",200);

        } catch (Exception $e) {

            return $this->errorResponse('Order not found or update failed',404);
        }
    }


    public function deleteAllOrders()
    {
        // Begin a transaction
        DB::beginTransaction();
        try {
            // Delete all records from order_items
            DB::table('order_items')->truncate();
            // Delete all records from orders
            DB::table('orders')->truncate();

            // Commit the transaction
            DB::commit();
            
            return response()->json(['success' => true, 'message' => 'All orders and order items have been deleted successfully.']);
        } catch (\Exception $e) {
            // Rollback the transaction if something goes wrong
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete orders and order items.'], 500);
        }
    }
}
