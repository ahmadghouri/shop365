<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request)
    {

        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comments' => 'required|string',
        ]);

        $user = Auth::user();

        Review::create([
            'user_id' => $user->id,
            'business_id' => $validated['business_id'],
            'order_id' => $validated['order_id'],
            'rating' => $validated['rating'],
            'comments' => $validated['comments'],
        ]);

        return response()->json(['message' => 'Review submitted successfully.']);
    }


    public function index($business_id)
    {
        $reviews = Review::with('user')->where( 'business_id', $business_id)->orderBy('created_at', 'desc')->paginate(1000);
        return response()->json(['reviews' => $reviews]);
    }
}
