require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const corsOptions = require('./config/cors');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/not-found.middleware');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: true, message: 'Server is running', data: null });
});

// API Routes — matching Laravel api.php structure exactly
app.use('/api', require('./modules/auth/auth.routes'));
app.use('/api', require('./modules/users/user.routes'));
app.use('/api', require('./modules/businesses/business.routes'));
app.use('/api', require('./modules/products/product.routes'));
app.use('/api', require('./modules/cart/cart.routes'));
app.use('/api', require('./modules/orders/order.routes'));
app.use('/api', require('./modules/towns/town.routes'));
app.use('/api', require('./modules/households/household.routes'));
app.use('/api', require('./modules/complaints/complaint.routes'));
app.use('/api', require('./modules/reviews/review.routes'));
app.use('/api', require('./modules/vouchers/voucher.routes'));
app.use('/api', require('./modules/easy-buys/easy-buy.routes'));
app.use('/api', require('./modules/header-images/header-image.routes'));
app.use('/api', require('./modules/perscriptions/perscription.routes'));
app.use('/api', require('./modules/grocery-products/grocery-product.routes'));
app.use('/api', require('./modules/pos-products/pos-product.routes'));
app.use('/api', require('./modules/internship-applications/internship-application.routes'));
app.use('/api', require('./modules/upload/upload.routes'));

// Admin routes — Laravel: Route::middleware(['auth:sanctum', AdminMiddleware::class])->prefix('/admin')
app.use('/api/admin', require('./modules/admin/admin.routes'));

// Restaurant admin routes — Laravel: Route::middleware(['auth:sanctum', TownAdminMiddleware::class])->prefix('/restaurantAdmin')
app.use('/api/restaurantAdmin', require('./modules/restaurants/restaurant.routes'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
