<?php

namespace App\Http\Controllers;

use App\Http\Requests\Products\StoreRequest;
use App\Http\Requests\Products\UpdateRequest;
use App\Http\Requests\Shop\StoreRequest as ShopStoreRequest;
use App\Models\Business;
use App\Models\Product;
use App\Services\ImageService;
use App\Services\ProductService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    protected $productService;
    protected $imageService;

    public function __construct(ProductService $productService, ImageService $imageService)
    {
        $this->productService = $productService;
        $this->imageService = $imageService;
    }
    /**
     * Display a listing of the resource.
     */
    public function businessProducts($businessId)
    {
        $products = Product::where('business_id', $businessId)->get();

        return $this->successResponse($products, 'All the products');
    }

    public function businessProductsTypes($businessId)
    {
        $types = Product::where('business_id', $businessId)->select('type')->distinct()->get();

        return $this->successResponse($types);
    }

    public function businessProductsFiltered(Request $request, $businessId)
    {
        $type = $request->get('type');

        $query = Product::where('business_id', $businessId);

        if(!empty($type))
        {
            $query->where('type', $type);
        }

        $products = $query->get();

        return $this->successResponse($products);
    }

    public function index(Request $request)
    {
        // Start with a query builder instance
        $query = Product::query()->select('id', 'title', 'image', 'price', 'business_id')->with('business');

        if ($request->has('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')->orWhere('type', 'like', '%' . $search . '%');
            });
        }

        $all_products = $query->get();
        return $this->successResponse($all_products, 'products');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $product = $this->productService->store($request->validated());

            if ($request->has('image')) {
                $imagePath = $this->imageService->uploadImage($request, 'image');
                $product->image = $imagePath;
                $product->save();
            }

            return $this->successResponse($product, 'Product created');
        } catch (\Exception $e) {
            // Return a JSON response with the exception message
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): JsonResponse
    {
        return $this->successResponse($product, 'Product details');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        if ($request->has('image')) {
            $imagePath = $this->imageService->uploadImage($request, 'image');
            $product->image = $imagePath;
            $product->save();
        }

        return $this->successResponse($product->refresh(), 'Updated Product');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->productService->delete($id);
            return $this->successResponse(null, 'Product deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Product not found', 404);
        } catch (Exception $e) {
            return $this->errorResponse('Product not found', 404);
        }
    }

    // for finding products related to the restaurant admin

    public function getProducts()
    {
        $user = auth()->user();
        $businessId = $user->business_id;

        $products = Product::where('business_id', $businessId)->get();
        return $this->successResponse($products, 'Products found');
    }

    public function randomProductsByBusiness()
    {
        $products = Product::select('id', 'title', 'image', 'price', 'business_id')
            ->with('business:id,name')
            ->inRandomOrder()
            ->get()
            ->groupBy('business_id')
            ->map(function ($group) {
                return $group->take(3);
            })
            ->values();

        return $this->successResponse($products, 'Three random products from each business');
    }

    public function businessProductsDiscount(Request $request, $businessId)
    {
        $discount = $request->get('discount', 0); // Get discount from request, default to 0

        $products = Product::where('business_id', $businessId)->get();

        // Apply discount dynamically to each product
        $products->each(function ($product) use ($discount) {
            $product->final_price = $product->price - $product->price * ($discount / 100);
        });

        return $this->successResponse($products, 'All the products with discounts applied');
    }

    public function updateDiscount(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $user = auth()->user();
        $businessId = $user->business_id;
        $products = Product::where('business_id', $businessId)->get();
        $discount = $request->input('discount');

        $products->each(function ($product) use ($discount) {
            $product->discount = $discount;
            $product->save();
        });

        // $product = Product::findOrFail($productId);
        $business = Business::findOrFail($businessId);
        $business->discount = $discount;
        $business->save();

        return $this->successResponse($products[0]);
    }

    public function removeDiscount()
    {
        // Ensure the user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get the authenticated user and their business ID
        $user = auth()->user();
        $businessId = $user->business_id;

        // Get all products associated with the business
        $products = Product::where('business_id', $businessId)->get();

        // Reset the discount for each product
        $products->each(function ($product) {
            $product->discount = 0;
            $product->save();
        });

        // Update the business to remove its discount
        $business = Business::findOrFail($businessId);
        $business->discount = 0;
        $business->save();

        return response()->json(['message' => 'Discount removed successfully']);
    }

    public function addProduct(ShopStoreRequest $request)
    {
        try {
            $product = $this->productService->add($request->validated());

            if ($request->has('image')) {
                $imagePath = $this->imageService->uploadImage($request, 'image');
                $product->image = $imagePath;
                $product->save();
            }

            return $this->successResponse($product, 'Product Created');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
