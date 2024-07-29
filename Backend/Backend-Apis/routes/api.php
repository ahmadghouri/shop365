<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ComplainController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\TownAdminMiddleware;
use App\Models\Complaint;
use Illuminate\Support\Facades\Route;

// routes/api.php

Route::post('/register', [AuthController::class, 'register']);
Route::post('/add-details', [AuthController::class, 'addDetails'])->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('/business', BusinessController::class);
Route::apiResource('/products', ProductController::class);
// this api point is for getting products related to specific restaurant
Route::get('/all-products/{businessId}', [ProductController::class, 'index']);


Route::group([
    'middleware' => ['auth:sanctum']
], function() {
    Route::post('/complaints', [ComplainController::class, 'store']);
    
    Route::apiResource('/towns', TownController::class);
    
    
    Route::post('cart', [CartController::class, 'addToCart']);
    Route::get('cart', [CartController::class, 'viewCart']);
    Route::delete('cart/{id}', [CartController::class, 'removeCart']);
    Route::delete('product/{id}', [CartController::class, 'removeProduct']);
    
    
    Route::post('order', [OrderController::class, 'placeOrder']);
    Route::get('orders', [OrderController::class, 'viewOrders']);
});


// main admin
Route::middleware(['auth:sanctum', AdminMiddleware::class])->prefix('/admin')->group(function() {

    Route::post("/createAdmins", [AdminController::class, 'createTownAdmin']);
    Route::apiResource('/towns', TownController::class);

    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('admin.users.show');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

});


// town admin
Route::middleware(['auth:sanctum', TownAdminMiddleware::class])->prefix('/restaurantAdmin')->group(function() {
    
    
    Route::put('/complaint-status', [ComplainController::class, 'update']);
    Route::get('/complaints', [ComplainController::class, 'complaintsOfTown']);

    Route::get('/allproducts', [ ProductController::class, 'getProducts']);

    // Route::get('/orders', [OrderController::class, 'viewAllOrders']);

    Route::get('/orders', [OrderController::class, 'viewRestaurantOrders']);
    
});