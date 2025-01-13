<?php

namespace App\Http\Controllers;

use App\Http\Requests\Products\StoreRequest;
use App\Http\Requests\Products\UpdateRequest;
use App\Http\Requests\Shop\StoreRequest as ShopStoreRequest;
use App\Models\Business;
use App\Models\cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\ImageService;
use App\Services\ProductService;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    protected $productService;
    protected $imageService;

    public function __construct(ProductService $productService, ImageService $imageService)
    {
        $this->productService = $productService;
        $this->imageService = $imageService;
    }

    public function deleteTodayProductsByBusinessId($businessId)
    {
        try {
            // Enable query logging
            DB::enableQueryLog();

            // Start a database transaction
            DB::beginTransaction();

            // Disable foreign key checks temporarily
            DB::statement('PRAGMA foreign_keys = OFF');

            // Log foreign key status
            $foreignKeyStatus = DB::select('PRAGMA foreign_keys');
            Log::info('Foreign Key Status:', $foreignKeyStatus);

            // Get today's date
            $today = Carbon::today(); // This will give you the current date without time

            // Find all products associated with the business created today
            $products = Product::where('business_id', $businessId)
                ->whereDate('created_at', $today)
                ->get();

            if ($products->isEmpty()) {
                return response()->json(['message' => 'No products found for the specified business ID created today'], 404);
            }

            // Collect all product IDs
            $productIds = $products->pluck('id');

            // Log products to be deleted
            Log::info('Deleting products for business ID ' . $businessId . ' created today', [
                'product_ids' => $productIds,
                'product_count' => $products->count(),
            ]);

            // Delete associated OrderItems
            OrderItem::whereIn('product_id', $productIds)->delete();

            // Delete associated Cart items
            cart::whereIn('product_id', $productIds)->delete();

            // Permanently delete the products created today
            Product::where('business_id', $businessId)
                ->whereDate('created_at', $today)
                ->delete();

            // Commit the transaction
            DB::commit();

            // Log successful deletion
            Log::info('Products created today deleted successfully for business ID ' . $businessId);

            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys = ON');

            // Log the executed SQL queries
            Log::info('Executed SQL Queries:', DB::getQueryLog());

            return response()->json(['message' => 'All products created today for business deleted successfully, along with associated order items and cart items.'], 200);

        } catch (Exception $e) {
            // Log the exception
            Log::error('Failed to delete products', [
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            // Rollback the transaction
            DB::rollBack();

            // Re-enable foreign key checks in case of an error
            DB::statement('PRAGMA foreign_keys = ON');

            // Log the executed SQL queries in case of failure
            Log::info('Executed SQL Queries:', DB::getQueryLog());

            return response()->json(['message' => 'Failed to delete products: ' . $e->getMessage()], 500);
        }
    }


    public function updateGroceryBusinessId()
    {
        // Update the business_id for all products with type 'grocery'
        $updated = Product::where('type', 'grocery')->update(['business_id' => 6]);

        // Check if any rows were updated
        if ($updated) {
            return response()->json(['message' => 'Business ID updated successfully for grocery products.'], 200);
        } else {
            return response()->json(['message' => 'No grocery products found or no updates made.'], 404);
        }
    }



    /**
     * Display a listing of the resource.
     */
    public function businessProducts(Request $request, $businessId)
    {
        $searchTerm = $request->input('search');

        $query = Product::where('business_id', $businessId);

        if (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                    ->orWhere('type', 'like', '%' . $searchTerm . '%');
            });
        }

        $products = $query->orderBy('discount', 'desc')->paginate(20); // Limit to 10 products per page (adjust as needed)

        return $this->successResponse($products, 'All the products');
    }

    public function businessAdminsProducts(Request $request, $businessId)
    {
        $searchTerm = $request->input('search');

        $query = Product::where('business_id', $businessId);

        if ($searchTerm) {
            $query->where('title', 'like', '%' . $searchTerm . '%');
        }

        $products = $query->get();

        return $this->successResponse($products, 'All the products');
    }



    public function businessProductsTypes($businessId)
    {
        $types = Product::where('business_id', $businessId)
            ->select('type')
            ->distinct()
            ->orderBy('type', 'asc') // Sort types alphabetically in ascending order
            ->get();
    
        return $this->successResponse($types);
    }
    

    public function businessProductsFiltered(Request $request, $businessId)
    {
        $type = $request->get('type');

        $query = Product::where('business_id', $businessId);

        if (!empty($type)) {
            $query->where('type', $type);
        }

        if ($request)

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

    public function getProducts(Request $request)
    {
        $user = auth()->user();
        $businessId = $user->business_id;

        $search = $request->input('search');

        $products = Product::where('business_id', $businessId)
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', '%' . $search . '%');
            })
            ->get();

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


    public function applyDiscountToProduct(Request $request, $productId)
    {
        // Ensure the user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        // Validate the discount input
        $request->validate([
            'discount' => 'required|numeric|min:0|max:100', // Ensure discount is between 0 and 100
        ]);
    
        // Find the product by its ID
        $product = Product::find($productId);
    
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    
        // Apply the discount and calculate the final price
        $discount = $request->input('discount');
        $product->discount = $discount;
        $product->price = $product->price - ($product->price * ($discount / 100)); // Calculate final price
    
        // Save the updated product
        $product->save();
    
        return $this->successResponse($product, 'Discount applied to the product');
    }
    

}
