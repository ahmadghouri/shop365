<?php

namespace App\Http\Controllers;

use App\Events\TestEvent;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
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
        ]);
        $userPoints = $request->input('userPoints', false);
        return $this->orderService->placeOrder($userPoints);
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
    $orders = $this->orderService->viewRestaurantOrders($businessId);

    // Merge orders and businessId into a single array
    $data = array_merge(['orders' => $orders], ['business_id' => $businessId]);

    return $this->successResponse($data, "Restaurant Orders", 200);
    }



    public function superAdminOrders($businessId) 
    {
        $orders = $this->orderService->viewRestaurantOrdersAdmin($businessId);
        $data = array_merge(['orders' => $orders], ['business_id' => $businessId]);
    
        return $this->successResponse($data, "Restaurant Orders", 200);
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
