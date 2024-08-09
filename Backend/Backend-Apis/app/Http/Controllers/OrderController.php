<?php

namespace App\Http\Controllers;

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
        return $this->successResponse($orders,"Restaurant Orders", 200);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, $id)
    {
        

        try {
            $order = $this->orderService->updateOrderStatus($id, $request->status);

            return $this->successResponse($order,"Order status updated successfully",200);

        } catch (Exception $e) {

            return $this->errorResponse('Order not found or update failed',404);
        }
    }
}
