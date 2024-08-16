<?php

namespace App\Http\Controllers;

use App\Events\TestEvent;
use App\Http\Requests\UpdateOrderStatusRequest;
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
        return $this->orderService->placeOrder();
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


    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,preparing,delivered',
        ]);


        try {
            $order = $this->orderService->updateOrderStatus($id, $request->status);

            return $this->successResponse($order,"Order status updated successfully",200);

        } catch (Exception $e) {

            return $this->errorResponse('Order not found or update failed',404);
        }
    }
}
