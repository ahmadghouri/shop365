<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPassword;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ComplainController;
use App\Http\Controllers\EasyBuyController;
use App\Http\Controllers\GroceryProductController;
use App\Http\Controllers\HeaderImageController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\InternshipApplicationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PerscriptionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoucherController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\TownAdminMiddleware;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Route;

//Easy Buy management
Route::post('/easy-buy', [EasyBuyController::class, 'store']);
Route::get('/easy-buy', [EasyBuyController::class, 'index']);

Route::apiResource('header-images', HeaderImageController::class);
Route::post('header-images/reorder', [HeaderImageController::class, 'reorder']);

Route::post('/update-grocery-business-id', [ProductController::class, 'updateGroceryBusinessId']);
Route::post('import-grocery-products', [GroceryProductController::class, 'storeGroceryProducts']);

Route::delete('delete-products/{businessId}', [ProductController::class, 'deleteTodayProductsByBusinessId']);
Route::delete('/orders/delete-all', [OrderController::class, 'deleteAllOrders']);
Route::delete('/users/cleanup', [UserController::class, 'deleteUsers']);


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/update-password', [ForgotPassword::class, 'updatePassword']);

// Business and products
Route::apiResource('/business', BusinessController::class);
Route::apiResource('/products', ProductController::class);

// for child businesses 
Route::get('/business/{businessId}/sub-businesses', [BusinessController::class, 'getChildBusiness']);

// for updating the status of the product
Route::post('/product/{id}/status', [ProductController::class, 'updateStatus']);


Route::get('/all-products/{businessId}', [ProductController::class, 'businessProducts']);
Route::get('/all-products/{businessId}/admin', [ProductController::class, 'businessAdminsProducts']);

Route::get('/random-products', [ProductController::class, 'randomProductsByBusiness']);
Route::get('/business/{businessId}/products', [ProductController::class, 'businessProductsDiscount']);

Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::get('/orders/{id}', [OrderController::class, 'show']);

Route::apiResource('/towns', TownController::class);

Route::get('businessTypes/{businessId}', [ProductController::class, 'businessProductsTypes']);
Route::get('products/{businessId}/filtered', [ProductController::class, 'businessProductsFiltered']);

Route::put('/update/{id}', [UserController::class, 'update'])->name('admin.users.update');
Route::put('/update/household', [HouseholdController::class, 'update']);

Route::get('/getNumber/{businessId}', [BusinessController::class, 'getNumber']);
// Routes requiring authentication

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart/apply-voucher', [VoucherController::class, 'applyVoucher']);

    Route::post('/reorder/{order}', [OrderController::class, 'reorder']);
    Route::get('/refreshUser', [UserController::class, 'refreshUser']);
    Route::post('/add-details', [AuthController::class, 'addDetails']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/{business_id}', [ReviewController::class, 'index']);

    // Complaints
    Route::post('/complaints', [ComplainController::class, 'store']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Cart
    // routes/api.php
    Route::prefix('cart')->group(function () {
        Route::post('/', [CartController::class, 'addToCart']);
        Route::get('/', [CartController::class, 'viewCart']);
        Route::delete('{id}', [CartController::class, 'removeCart']);
        Route::delete('product/{id}', [CartController::class, 'removeProduct']);
        Route::patch('update/{id}', [CartController::class, 'updateQuantity']); // Add this line
    });

    //Internship Application
    Route::post('internship/apply', [InternshipApplicationController::class, 'store']);

    // Prescription
    // routes/api.php
    Route::prefix('prescription')->group(function () {
        Route::post('/', [PerscriptionController::class, 'store']);
    });

    // Orders
    Route::prefix('order')->group(function () {
        Route::post('/', [OrderController::class, 'placeOrder']);
        Route::get('/', [OrderController::class, 'viewOrders']);
    });

    // Businesses and Products

    // Towns
    Route::get('/get-towns', [TownController::class, 'index']);

    Route::get('/cart/item-count', [CartController::class, 'getItemCount']);
});

// Admin routes
// Admin routes
Route::middleware(['auth:sanctum', AdminMiddleware::class])
    ->prefix('/admin')
    ->group(function () {
        // create the voucher
        Route::post('/create-voucher', [VoucherController::class, 'store']);
        // get all the voucher
        Route::get('/get-voucher', [VoucherController::class, 'getVoucher']);
        // delete the specific voucher
        Route::delete('/voucher/{id}/delete', [VoucherController::class, 'deleteVoucher']);

        Route::get('/business-orders/{id}', [OrderController::class, 'superAdminOrders']);
        // for just grocery
        Route::get('/grocery/{id}', [OrderController::class, 'getGroceryOrders']);

        Route::get('/business-stats', [BusinessController::class, 'getBusinessStats']);

        // Admins management
        Route::post('/createAdmins', [AdminController::class, 'createTownAdmin']);

        // Get all intern applications  
        Route::get('/internship-applications', [InternshipApplicationController::class, 'index']);

        // Users management

        // for prev two days user
        Route::get('/users/previous-two-days', [UserController::class, 'usersRegisteredToday']);
        // all users
        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

        Route::get('/vendors', [AdminController::class, 'getAdmins']);

        Route::put('/admins/{id}', [AdminController::class, 'updateAdmin']);
    });
// Town admin routes
Route::middleware(['auth:sanctum', TownAdminMiddleware::class])
    ->prefix('/restaurantAdmin')
    ->group(function () {
        // get and reply to the reviews
        Route::get('/get-reviews', [ReviewController::class, 'getReviews']);
        Route::post('/review/{review_id}/reply', [ReviewController::class, 'reply']);
        // Complaints management
        Route::put('/complaint-status', [ComplainController::class, 'update']);
        Route::get('/complaints', [ComplainController::class, 'complaintsOfTown']);

        // Products management
        Route::get('/allproducts', [ProductController::class, 'getProducts']);

        // Orders management
        Route::get('/orders', [OrderController::class, 'viewRestaurantOrders']);

        Route::post('/products/discount', [ProductController::class, 'updateDiscount']);
        Route::get('/products/removeDiscount', [ProductController::class, 'removeDiscount']);

        Route::post('/add-products', [ProductController::class, 'addProduct']);


        Route::post('/products/{productId}/apply-discount', [ProductController::class, 'applyDiscountToProduct']);

        Route::patch('/products/{product}/toggle-active', [ProductController::class, 'toggleActive']);
    });

Route::post('/test/channel', function () {
    $order = Order::select('*')->orderByDesc('id')->first();
    $order2 = \App\Models\OrderItem::select('*')->orderByDesc('id')->first();
    \App\Events\TestEvent::dispatch($order2);
    return response()->json(['message' => 'Event dispatched successfully'], 200);
});
