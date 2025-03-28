<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Events\TestEvent;
use App\Models\Business;
use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Voucher;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrderManageService
{
    public function placeOrder($userPoints = false, $voucherCode = null)
    {
        // Retrieve the user's cart items
        $cartItems = cart::where('user_id', auth()->id())->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        $user = Auth::user();
        $ordersByBusiness = $cartItems->groupBy(function ($cartItem) {
            return $cartItem->product->business_id;
        });

        $orders = [];
        $failedBusinesses = [];
        $specialBusinesses = [];

        foreach ($ordersByBusiness as $businessId => $items) {
            // Calculate total price using final_price if available
            $totalPrice = $items->sum(function ($cartItem) {
                $product = $cartItem->product;
                return ($product->final_price ?? $product->price) * $cartItem->quantity;
            });

            $minOrderAmount = ($businessId == 6) ? 1000 : 500;
            $business = Business::find($businessId);

            if ($totalPrice < $minOrderAmount) {
                if ($businessId == 6) {
                    $specialBusinesses[] = $business ? $business->name : 'Unknown Restaurant';
                } else {
                    $failedBusinesses[] = $business ? $business->name : 'Unknown Restaurant';
                }
            }
        }

        if (count($failedBusinesses) > 0 || count($specialBusinesses) > 0) {
            $message = 'Order(s) cannot be placed. ';

            if (count($specialBusinesses) > 0) {
                $message .= 'Minimum order amount is 1000 rupees for: ' . implode(', ', $specialBusinesses) . '. ';
            }

            if (count($failedBusinesses) > 0) {
                $message .= 'Minimum order amount is 500 rupees for: ' . implode(', ', $failedBusinesses) . '.';
            }

            return response()->json(
                [
                    'message' => trim($message),
                    'failed_businesses' => $failedBusinesses,
                    'special_businesses' => $specialBusinesses,
                ],
                400
            );
        }

        // Apply voucher discount if voucher code is provided
        $voucher = null;
        if ($voucherCode) {
            $voucher = Voucher::where('code', strtolower($voucherCode))->first();

            if (!$voucher) {
                return response()->json(['message' => 'Invalid voucher code'], 400);
            }

            // Check if the voucher has expired
            if ($voucher->expiry_date && Carbon::parse($voucher->expiry_date)->isBefore(Carbon::now())) {
                return response()->json(['message' => 'Voucher has expired'], 400);
            }
        }

        foreach ($ordersByBusiness as $businessId => $items) {
            $totalPrice = $items->sum(function ($cartItem) {
                $product = $cartItem->product;
                return ($product->final_price ?? $product->price) * $cartItem->quantity;
            });

            // Apply user points discount if available
            if ($userPoints && $user->points >= 250) {
                $pointsToUse = min($user->points, $totalPrice);
                $totalPrice -= $pointsToUse;
                $user->points -= $pointsToUse;
                $user->save();
            }

            // Apply voucher discount if available
            if ($voucher) {
                $discountAmount = min($voucher->discount_amount, $totalPrice);
                $totalPrice -= $discountAmount;
            }

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'total_price' => $totalPrice,
                'status' => 'pending',
                'voucher_id' => $voucher ? $voucher->id : null, // Store the voucher ID in the order
            ]);

            foreach ($items as $cartItem) {
                $product = $cartItem->product;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'price' => $product->final_price ?? $product->price,
                    'quantity' => $cartItem->quantity,
                ]);

                $cartItem->delete();
            }

            // Dispatch the event (optional)
            // event(new OrderPlaced($order, $businessId));
            $currentBusiness = Business::find($businessId);
            $this->dispatchOrderEvents($order, $currentBusiness);
            $orders[] = $order;
        }

        return response()->json([
            'message' => 'Order(s) placed successfully',
            'orders' => $orders
        ], 200);
    }

    private function dispatchOrderEvents($order, $business)
    {
        if (!$business) return;

        // Dispatch event for the current business
        event(new OrderPlaced($order, $business->id));

        // Check for and dispatch event to the parent business
        if ($business->parent_id) {
            $parentBusiness = Business::find($business->parent_id);
            if ($parentBusiness) {
                event(new OrderPlaced($order, $parentBusiness->id));
            }
        }
    }


    public function viewOrders($userId)
    {
        $today = Carbon::now('Asia/karachi')->addDay()->toDateString();
        $startOfLastMonth = Carbon::now('Asia/karachi')->subMonth()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        return Order::where('user_id', $userId)
            ->whereBetween('created_at', [$startOfLastMonth, $today])
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function viewAllOrders()
    {
        return Order::with('items.product', 'user')->get();
    }

    public function viewRestaurantOrders($businessId, $page)
    {
        // Get the parent business and its immediate children
        $businessIds = Business::where('id', $businessId)
            ->orWhere('parent_id', $businessId) // Include child businesses
            ->pluck('id'); // Get the IDs as a collection

        // Fetch orders for the parent and its children
        return Order::whereHas('items.product', function ($query) use ($businessIds) {
                $query->whereIn('business_id', $businessIds);
            })
            ->with('items.product', 'user', 'user.household', 'user.household.town')
            ->orderBy('created_at', 'desc') // Ensure consistent order
            ->paginate(15, ['*'], 'page', $page); // Paginate with 15 orders per page
    }




    public function viewRestaurantOrdersAdmin($businessId)
    {
        return Order::whereHas('items.product', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
            ->whereDate('created_at', Carbon::today())
            ->with('items.product', 'user', 'user.household', 'user.household.town')
            ->get();
    }

    public function updateOrderStatus($orderId, $newStatus)
    {
        $order = Order::findOrFail($orderId);
        $previousStatus = $order->status;

        // Only proceed if the status has changed
        if ($previousStatus !== $newStatus) {
            $order->status = $newStatus;
            $order->save();

            $isGroceryOrder = $order->items->every(function ($item) {
                return $item->product->business->type === 'Grocery';
            });

            if ($isGroceryOrder) {
                $user = $order->user;
                $totalPrice = $order->total_price;

                // Points adjustment logic
                if ($newStatus === 'delivered') {
                    // Add points if the new status is 'delivered'
                    $pointsToAdd = $totalPrice * 0;
                    $user->points += $pointsToAdd;
                } elseif ($previousStatus === 'delivered') {
                    // Subtract points if reverting from 'delivered'
                    $pointsToSubtract = $totalPrice * 0;
                    $user->points -= $pointsToSubtract;
                }

                $user->save();
            }
        }

        return $order;
    }

}
