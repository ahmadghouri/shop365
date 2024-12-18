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

        $existingReview = Review::where('order_id', $validated['order_id'])
        ->where('user_id', $user->id)
        ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this order.'], 422);
        }

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
        $reviews = Review::with('user')->with('business:id,name')->where( 'business_id', $business_id)->orderBy('created_at', 'desc')->paginate(1000);
        return response()->json(['reviews' => $reviews]);
    }

    public function reply(Request $request, $review_id)
    {
        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        $review = Review::find($review_id);

        if(!$review)
        {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $business = Auth::user();

        if($business->business_id != $review->business_id)
        {
            return response()->json(['message' => 'You are not authorized to reply to this review'], 403);
        }

        if ($review->reply) {
            return response()->json(['message' => 'This review has already been replied to'], 422);
        }

        $review->reply = $validated['reply'];
        $review->save();

        return response()->json(['message' => 'Reply submitted successfully.', 'review' => $review]);
    }

    public function getReviews()
    {
        $business_id = Auth::user()->business_id;
        $reviews = Review::with('user')->with('business:id,name')->where('business_id', $business_id)->orderBy('created_at', 'desc')->get();
        return response()->json(['reviews' => $reviews]);
    }
}
