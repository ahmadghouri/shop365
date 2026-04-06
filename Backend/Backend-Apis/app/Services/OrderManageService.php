<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Events\TestEvent;
use App\Models\Business;
use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Perscription;
use App\Models\Voucher;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderManageService
{
    private const DELIVERY_CHARGE = 50;
    protected $imageService;

    public function placeOrder($userPoints = false, $voucherCode = null)
    {
        // Retrieve the user's cart items
        $cartItems = Cart::where('user_id', auth()->id())->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        // Check if any regular item is inactive
        $inactiveItems = $cartItems->reject(function ($cartItem) {
            return strtolower($cartItem->product->title) === 'prescription';
        })->filter(function ($cartItem) {
            return $cartItem->product->is_active === 0;
        });

        if ($inactiveItems->isNotEmpty()) {
            $productNames = $inactiveItems->map(function ($item) {
                return $item->product->title;
            })->unique()->implode(', ');

            return response()->json(
                [
                    'message' => 'Some items are currently out of stock: ' . $productNames . '. Please remove them first!'
                ],
                400
            );
        }

        // Check if the cart contains any prescription items
        $hasPrescriptionInCart = $cartItems->contains(function ($cartItem) {
            return strtolower($cartItem->product->title || $cartItem->product->type) === 'prescription';
        });

        $user = Auth::user();
        $ordersByBusiness = $cartItems->groupBy(function ($cartItem) {
            return $cartItem->product->business_id;
        });

        $orders = [];
        $failedBusinesses = [];
        $specialBusinesses = [];

        foreach ($ordersByBusiness as $businessId => $items) {
            // Separate prescription items from regular items
            $prescriptionItems = $items->filter(function ($cartItem) {
                return strtolower($cartItem->product->title) === 'prescription';
            });

            $regularItems = $items->reject(function ($cartItem) {
                return strtolower($cartItem->product->title) === 'prescription';
            });

            // Calculate total price for regular items
            $totalRegularPrice = $regularItems->sum(function ($cartItem) {
                $product = $cartItem->product;
                return ($product->final_price ?? $product->price) * $cartItem->quantity;
            });

            foreach ($ordersByBusiness as $businessId => $items) {
                $totalPrescriptionPrice = $prescriptionItems->sum(function ($cartItem) {
                    $product = $cartItem->product;
                    return ($product->final_price ?? $product->price) * $cartItem->quantity;
                });

            // Combine regular and prescription items if both are present
            $totalPrice = $totalRegularPrice + $totalPrescriptionPrice;
            // Skip minimum order amount check if there are prescription items in this business's cart
            if ($prescriptionItems->isEmpty()) {
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
           
        }

        if (!$hasPrescriptionInCart && count($failedBusinesses) > 0 || count($specialBusinesses) > 0) {
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

            $allFromSpecificBusiness = $cartItems->every(function ($item) {
                return $item->product->business_id == 6;
            });

            // Apply user points discount if available
            if ($userPoints && $user->points >= 250) {

                if ($allFromSpecificBusiness) {
                    $pointsToUse = min($user->points, $totalPrice);
                    $totalPrice -= $pointsToUse;
                    $user->points -= $pointsToUse;
                    $user->save();
                }else {
                    return response()->json(['message' => 'Loyalty Points are only applicable to Shop365 Mart'], 400);
                } 

            }

            // Apply voucher discount if available
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

                $discountAmount = min($voucher->discount_amount, $totalPrice);
                $totalPrice -= $discountAmount;
            }

            // Add a fixed delivery charge to every order total.
            if ($businessId == 6) {
                $totalPrice += self::DELIVERY_CHARGE;
            }

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'total_price' => $totalPrice,
                'status' => 'pending',
                'voucher_id' => $voucher ? $voucher->id : null,
            ]);

            $this->attachDeliveryMeta($order);

            // Add regular items to the order
            foreach ($regularItems as $cartItem) {
                $product = $cartItem->product;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'price' => $product->final_price ?? $product->price,
                    'quantity' => $cartItem->quantity,
                ]);

                $cartItem->delete();
            }

            // Add prescription items to the order
            foreach ($prescriptionItems as $cartItem) {
                $product = $cartItem->product;

                $prescription = Perscription::where('user_id', $order->user_id)
                    ->whereNull('order_id')
                    ->latest()
                    ->first();

                // If prescription found, link it to the order
                if ($prescription) {
                    $prescription->update([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                    ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'price' => $product->final_price ?? $product->price,
                    'quantity' => $cartItem->quantity,
                ]);

                $cartItem->delete();
            }

            // Dispatch the event (optional)
            $currentBusiness = Business::find($businessId);
            $this->dispatchOrderEvents($order, $currentBusiness);
            $orders[] = $order;
        }

        // Prepare the response
        $response = [
            'message' => 'Order(s) placed successfully',
            'orders' => $orders,
        ];

        // Add warning or error message if any businesses failed
        if (count($failedBusinesses) > 0) {
            if ($hasPrescriptionInCart) {
                // If the cart contains prescription items, show a warning
                $response = [
                    'message' => 'Prescription Order placed. But the other business order(s) could not be placed. Reason: Minimum order amount is 500 rupees for each business.',
                    'failed_businesses' => $failedBusinesses,
                ];
            } else {
                // If the cart contains only regular items, show an error
                return response()->json(
                    [
                        'message' => 'Order(s) cannot be placed. Minimum order amount is 500 rupees for each business.',
                        'failed_businesses' => $failedBusinesses,
                    ],
                    400
                );
            }
        }

        return response()->json($response, 200);
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
        $businessIds = Cache::remember("biz_ids_$businessId", 60, function () use ($businessId) {
            return Business::where('id', $businessId)
                ->orWhere('parent_id', $businessId)
                ->pluck('id');
        });

        // First, get order IDs that match the business criteria through join
        $orderIds = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereIn('products.business_id', $businessIds)
            ->distinct()
            ->pluck('orders.id');

        // Then retrieve and paginate the actual orders using Eloquent
        return Order::whereIn('id', $orderIds)
            ->with([
                'items.product',
                'user',
                'user.household',
                'user.household.town',
                'perscription'
            ])
            ->orderByDesc('created_at')
            ->paginate(15, ['*'], 'page', $page);
    }

    public function viewRestaurantOrdersAdmin($businessId)
    {
        return Order::whereHas('items.product', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
            ->whereDate('created_at', Carbon::today())
            ->with(['items.product', 'user', 'user.household', 'user.household.town'])
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
                    // $pointsToAdd = round($totalPrice * (1/100));
                    // $user->points += $pointsToAdd;
                } elseif ($previousStatus === 'delivered') {
                    // Subtract points if reverting from 'delivered'
                    $pointsToSubtract = round($totalPrice * (1/100));
                    $user->points -= $pointsToSubtract;
                }

                $user->save();
            }
        }

        return $order;
    }

    public function attachDeliveryMeta($order)
    {
        $order->delivery_charge = self::DELIVERY_CHARGE;
        $order->total_amount = (float) $order->total_price;

        return $order;
    }

}
