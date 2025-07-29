<?php

namespace App\Http\Controllers;

use App\Models\EasyBuy;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EasyBuyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $easyBuys = EasyBuy::all();
        return response()->json($easyBuys);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {   
       //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'nullable|string|max:255',
                'payload' => 'required',
            ]);

            // For SQLite, we need to manually ensure proper JSON encoding
            $payload = $validated['payload'];
            if (!is_string($payload)) {
                $payload = json_encode($payload, JSON_UNESCAPED_UNICODE);
            }

            $easyBuy = EasyBuy::firstOrCreate([
                'title' => $validated['title'],
                'business_id' => 4,
                'image' => $validated['image'],
                'payload' => $payload
            ]);

            foreach ($easyBuy->payload as $brand => $sizes) {
                foreach ($sizes as $size => $price) {
                    $product = Product::create([
                        'title' => "{$brand} {$size}",
                        'type' => 'easy_buy',
                        'business_id' => 4,
                        'description' => "Easy Buy: {$easyBuy->title} - {$brand} - {$size}",
                        'price' => $price,
                        'image' => $easyBuy->image,
                    ]);
                    Log::info('Product Created: ', ['product' => $product]);
                }
            }


            return response()->json([   
                'message' => 'Product created successfully',
                'data' => $easyBuy
            ], 201);

        } catch (\JsonException $e) {
            return response()->json([
                'message' => 'Invalid JSON payload',
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EasyBuy $easyBuy)
    {
        //
    }

    // Resolve product method
    public function resolveProduct(Request $request)
    {
        $items = $request->validate([
            '*.easyBuyId' => 'required|exists:easy_buys,id',
            '*.brand' => 'required|string',
            '*.size' => 'required|string',
            '*.quantity' => 'required|integer|min:1',
        ]);

        foreach ($items as $item) {
            $easyBuy = EasyBuy::findOrFail($item['easyBuyId']);
            $payload = $easyBuy->payload;

            if (!isset($payload[$item['brand']][$item['size']])) {
                return response()->json(['error' => 'Invalid selection'], 422);
            }

            $price = $payload[$item['brand']][$item['size']];
            Log::info("Resolving EasyBuy item: {$item['brand']} - {$item['size']} with price {$price}");
            $title = "{$easyBuy->title} - {$item['brand']} - {$item['size']}";

            // Reuse or create shadow product
            $product = Product::firstOrCreate([
                    'title' => $title,
                    'type' => 'easy_buy',
                    'business_id' => $easyBuy->business_id,
                    'description' => "Easy Buy: {$title}",
                    'price' => $price,
                    'image' => $easyBuy->image,
                ]);
        }

        return response()->json(['message' => 'EasyBuy items added to cart', 'product_id' => $product->id], 200);
    }
}
