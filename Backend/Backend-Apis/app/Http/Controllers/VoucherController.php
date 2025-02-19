<?php

namespace App\Http\Controllers;

use App\Http\Requests\VoucherStoreRequest;
use App\Models\cart;
use App\Models\Order;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoucherController extends Controller
{

    public function store(VoucherStoreRequest $request)
    {
        $validated = $request->validated();
        Log::info($validated);
        $voucher = Voucher::create($request->validated());
        return $this->successResponse($voucher, 'Voucher created successfully');
    }

    public function applyVoucher(Request $request)
    {
        $voucherCode = strtolower($request->input('voucher_code'));
        $voucher = Voucher::where('code', $voucherCode)->first();

        if (!$voucher) {
            return $this->errorResponse('Invalid voucher code', 400);
        }

        if ($voucher->expiry_date && Carbon::parse($voucher->expiry_date)->isBefore(Carbon::now())) {
            return $this->errorResponse('Voucher has expired', 400);
        }

        $user = auth()->user();
        $voucherUsage = Order::where('user_id', $user->id)
            ->where('voucher_id', $voucher->id)
            ->exists();

        if ($voucherUsage) {
            return $this->errorResponse('Voucher already used', 400);
        }

        $cartItems = Cart::where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        // Separate active and inactive products
        $activeProducts = $cartItems->filter(function ($cartItem) {
            return $cartItem->product->status === 1; // Active products
        });

        $inactiveProducts = $cartItems->filter(function ($cartItem) {
            return $cartItem->product->status === 0; // Inactive products
        });

        // Calculate total price of active products
        $totalActivePrice = $activeProducts->sum(function ($cartItem) {
            $product = $cartItem->product;
            return ($product->final_price ?? $product->price) * $cartItem->quantity;
        });

        $totalInActivePrice = $inactiveProducts->sum(function ($cartItem) {
            $product = $cartItem->product;
            return ($product->final_price ?? $product->price) * $cartItem->quantity;
        });


        // Check if the total price of active products meets the voucher's minimum purchase requirement
        if ($totalActivePrice < $voucher->min_purchase_amount) {
            // Calculate the remaining amount needed to apply the voucher
            $remainingAmount = $voucher->min_purchase_amount - $totalActivePrice;

            // Get the names of inactive products
            $inactiveProductNames = $inactiveProducts->map(function ($cartItem) {
                return $cartItem->product->title; // Assuming the product name is stored in the 'title' column
            })->implode(', '); // Join the names with a comma

            return response()->json([
                'message' => 'Voucher cannot be applied yet. Due to: ' . $inactiveProductNames . ' Buy products of worth more than : ' . $totalInActivePrice,
                'remaining_amount' => $remainingAmount,
                'inactive_products' => $inactiveProductNames,
                'action_required' => 'Add products worth ' . $remainingAmount . ' more to apply the voucher.',
            ], 400);
        }

        // Check if all active products belong to the same business
        $ordersByBusiness = $activeProducts->groupBy(function ($cartItem) {
            return $cartItem->product->business_id;
        });

        if ($ordersByBusiness->count() > 1) {
            return response()->json(['message' => 'Voucher can only be applied if all items belong to the same business'], 400);
        }

        $cartBusinessId = $ordersByBusiness->keys()->first();
        if ($voucher->business_id !== $cartBusinessId) {
            return response()->json(['message' => 'Voucher cannot be applied to the products in your cart'], 400);
        }

        // Apply the voucher
        $discountedPrice = $totalActivePrice - $voucher->discount_amount;

        // Get the names of inactive products (if any)
        $inactiveProductNames = $inactiveProducts->map(function ($cartItem) {
            return $cartItem->product->title;
        })->implode(', ');

        if ($inactiveProducts) {

            return response()->json([
                'message' => 'Voucher applied successfully but not on these products:' . $inactiveProductNames,
                'discount' => $voucher->discount_amount,
                'cart_total' => $totalActivePrice,
                'final_price' => $discountedPrice,
                'inactive_products' => $inactiveProductNames ? 'Voucher not applied to the following inactive products: ' . $inactiveProductNames : null,
            ], 200);
        }


        return response()->json([
            'message' => 'Voucher applied successfully.',
            'discount' => $voucher->discount_amount,
            'cart_total' => $totalActivePrice,
            'final_price' => $discountedPrice,
            'inactive_products' => $inactiveProductNames ? 'Voucher not applied to the following inactive products: ' . $inactiveProductNames : null,
        ], 200);
    }

    public function getVoucher()
    {
        try {
            $vouchers = Voucher::with('business:id,name')->orderBy('created_at', 'desc')->get();;
            return $this->successResponse($vouchers, 'Vouchers retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve vouchers', 500);
        }
    }

    public function deleteVoucher($id)
    {
        try {
            $voucher = Voucher::find($id);
            if (!$voucher) {
                return $this->errorResponse('Voucher not found', 404);
            }
            $voucher->delete();
            return $this->successResponse('Voucher deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete voucher: ' . $e->getMessage(), 500);
        }
    }
}
