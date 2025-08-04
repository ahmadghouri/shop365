<?php

namespace App\Http\Controllers;

use App\Models\EasyBuy;
use App\Models\Product;
use App\Services\EasyBuyService;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Stmt\TryCatch;

class EasyBuyController extends Controller
{
    protected $imageService;
    protected $easyBuyService;

    public function __construct(ImageService $imageService, EasyBuyService $easyBuyService)
    {
        $this->imageService = $imageService;
        $this->easyBuyService = $easyBuyService;
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
                'image' => 'nullable|image|max:2048|mimes:png,jpg,jpeg,svg,gif',
                'payload' => 'required',
            ]);

            $easyBuy = $this->easyBuyService->storeEasyBuy($validated, $request);
            
            if ($easyBuy->products()){
                return response()->json([
                    'message' => 'EasyBuy and products created successfully',
                    'data' => $easyBuy
                ], 201);
            }

        } catch (\JsonException $e) {
            return response()->json([
                'message' => 'Invalid JSON payload',
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server Error in EasyBuy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(EasyBuy $easyBuy)
    {
        return $this->successResponse($easyBuy, 'EasyBuy Product details');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EasyBuy $easyBuy)
    {
        return $this->successResponse($easyBuy, 'EasyBuy Product details');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $easybuy = EasyBuy::with('products')->findOrFail($id);

            DB::transaction(function () use ($easybuy) {
                $easybuy->products()->delete();
                $easybuy->delete();
            });

            // Now Store New Easybuy and related products also

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'image' => 'nullable|image|max:2048|mimes:png,jpg,jpeg,svg,gif',
                'payload' => 'required',
            ]);

            $easyBuy = $this->easyBuyService->storeEasyBuy($validated, $request);

            if ($easyBuy->products()) {
                return response()->json([
                    'message' => 'EasyBuy and products created successfully',
                    'data' => $easyBuy
                ], 201);
            }

        } catch (\JsonException $e) {
            return response()->json([
                'message' => 'Invalid JSON payload',
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server Error in EasyBuy update',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EasyBuy $easyBuy, $id)
    {
        try {
            $easybuy = EasyBuy::with('products')->findOrFail($id);

            DB::transaction(function () use ($easybuy) {
                $easybuy->products()->delete();
                $easybuy->delete();
            });

            return response()->json([
                'message' => 'EasyBuy and products deleted successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server Error in EasyBuy delete',
                'error' => $e->getMessage(),
            ], 500);
        }
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
                'message' => 'No related product found for the given items',
            ], 404);
        } else {
            return response()->json([
                'message' => 'Product found',
                'regularProducts' => $allProducts
            ], 200);
        }
    }
}
