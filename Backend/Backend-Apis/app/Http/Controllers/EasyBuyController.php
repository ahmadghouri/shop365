<?php

namespace App\Http\Controllers;

use App\Models\EasyBuy;
use App\Models\Product;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EasyBuyController extends Controller
{
    protected $imageService;


    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }
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

            if ($request->has('image')) {
                $imagePath = $this->imageService->uploadImage($request, 'image');
                $easyBuy->image = $imagePath;
                $easyBuy->save();
            }

            foreach ($easyBuy->payload as $brand => $sizes) {
                foreach ($sizes as $size => $price) {
                    $product = Product::create([
                        'title' => "{$easyBuy->title} {$brand} {$size}",
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
        $validated = $request->validate([
            'items' => 'required|array',
        ]);

        $allProducts = collect();

        // Process each item
        foreach ($validated['items'] as $item) {

            $title = $item['title'] . ' ' . $item['name'];

            $regularProducts = Product::where('type', 'easy_buy')
                ->where('title', $title)
                ->where('price', $item['price'])
                ->get();

            Log::info('✅ Regular Product Found', ['regular' => $regularProducts->toArray()]);

            $allProducts = $allProducts->merge($regularProducts);
        }


        if ($allProducts->isEmpty()) {
            return response()->json([
                'message' => 'No easy buy product found for the given items',
            ], 404);
        } else {
            return response()->json([
                'message' => 'Product found',
                'regularProducts' => $allProducts
            ], 200);
        }
    }
}
