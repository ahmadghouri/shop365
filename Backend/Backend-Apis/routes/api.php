<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPassword;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ComplainController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\TownAdminMiddleware;
use App\Models\Order;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/update-password', [ForgotPassword::class, 'updatePassword']);

// Business and products
Route::apiResource('/business', BusinessController::class);
Route::apiResource('/products', ProductController::class);

Route::get('/all-products/{businessId}', [ProductController::class, 'businessProducts']);
Route::get('/random-products', [ProductController::class, 'randomProductsByBusiness']);
Route::get('/business/{businessId}/products', [ProductController::class, 'businessProductsDiscount']);

Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

Route::apiResource('/towns', TownController::class);

// Routes requiring authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/add-details', [AuthController::class, 'addDetails']);

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

        Route::get('/business-stats', [BusinessController::class, 'getBusinessStats']);

        // Admins management
        Route::post('/createAdmins', [AdminController::class, 'createTownAdmin']);

        // Users management

        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

        // This line was missing a semicolon
        Route::get('/vendors', [AdminController::class, 'getAdmins']);
    });
// Town admin routes
Route::middleware(['auth:sanctum', TownAdminMiddleware::class])
    ->prefix('/restaurantAdmin')
    ->group(function () {
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
    });

Route::post('/test/channel', function () {
    $order = Order::select('*')->orderByDesc('id')->first();
    $order2 = \App\Models\OrderItem::select('*')->orderByDesc('id')->first();
    \App\Events\TestEvent::dispatch($order2);
    return response()->json(['message' => 'Event dispatched successfully'], 200);
});
