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
    
        $cartItems = cart::where('user_id', $user->id)->get();
    
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }
    
        $ordersByBusiness = $cartItems->groupBy(function ($cartItem) {
            return $cartItem->product->business_id;
        });
    
        if ($ordersByBusiness->count() > 1) {
            return response()->json(['message' => 'Voucher can only be applied if all items belong to the same business'], 400);
        }

        $cartBusinessId = $ordersByBusiness->keys()->first();
        if ($voucher->business_id !== $cartBusinessId) {
            return response()->json(['message' => 'Voucher cannot be applied to the products in your cart'], 400);
        }
    
        $totalPrice = $cartItems->sum(function ($cartItem) {
            $product = $cartItem->product;
            return ($product->final_price ?? $product->price) * $cartItem->quantity;
        });

        if ($totalPrice < $voucher->min_purchase_amount) {
            return $this->errorResponse("Minimum purchase amount of {$voucher->min_purchase_amount} required", 400);
        }
    
        // $discountAmount = min($voucher->discount ?? 0, $totalPrice);
        // $discountedPrice = $totalPrice - $discountAmount;
    
        // // Locate the user's pending order and update it
        // $order = Order::where('user_id', $user->id)
        //     ->where('status', 'pending') // Adjust status to match your pending logic
        //     ->first();
    
        // if (!$order) {
        //     return response()->json(['message' => 'No pending order found'], 404);
        // }
    
        // $order->update([
        //     'total_price' => $discountedPrice,
        //     'voucher_id' => $voucher->id,
        // ]);
    
        return response()->json([
            'message' => 'Voucher applied successfully',
            'discount' => $voucher->discount_amount,
            'cart_total' => $totalPrice,
            'final_price' => $totalPrice - $voucher->discount_amount,
        ], 200);
    }

    public function getVoucher()
    {
        try {
            $vouchers = Voucher::with('business:id,name')->orderBy('created_at', 'desc')->get();            ;
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
