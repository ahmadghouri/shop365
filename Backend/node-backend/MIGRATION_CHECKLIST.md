# Laravel to Node.js Migration Checklist

## Project: NBTHUB Services (Shop365)
## Stack: Node.js, Express.js, MongoDB, Mongoose (JavaScript - No TypeScript)

---

## Laravel Backend Summary

| Category | Details |
|----------|---------|
| Framework | Laravel 11 |
| Auth | Laravel Sanctum (token-based) |
| Database | SQLite |
| Broadcasting | Pusher (Laravel Echo) |
| Queue | Database-backed job queue |
| File Storage | Local storage (file + base64 uploads) |
| Roles | admin, restaurant_admin, end_user |

---

## Module Migration Checklist

### 1. AUTH MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| AuthController.php | modules/auth/auth.controller.js | ⬜ Pending |
| userService.php | modules/auth/auth.service.js | ⬜ Pending |
| RegisterRequest.php | modules/auth/auth.validation.js | ⬜ Pending |
| LoginRequest.php | modules/auth/auth.validation.js | ⬜ Pending |
| ForgotPassword.php | modules/auth/auth.controller.js | ⬜ Pending |
| User.php (model) | modules/users/user.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/register
- POST /api/login
- POST /api/update-password
- POST /api/add-details (auth)
- GET /api/profile (auth)
- GET /api/refreshUser (auth)

---

### 2. USERS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| UserController.php | modules/users/user.controller.js | ⬜ Pending |
| User.php | modules/users/user.model.js | ⬜ Pending |
| AdminController.php | modules/users/admin.controller.js | ⬜ Pending |
| AdminService.php | modules/users/admin.service.js | ⬜ Pending |

**Endpoints:**
- PUT /api/update/{id}
- DELETE /api/users/cleanup
- GET /api/admin/users (admin)
- GET /api/admin/users/{id} (admin)
- DELETE /api/admin/users/{id} (admin)
- GET /api/admin/users/previous-two-days (admin)
- POST /api/admin/createAdmins (admin)
- GET /api/admin/vendors (admin)
- PUT /api/admin/admins/{id} (admin)

---

### 3. BUSINESS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| BusinessController.php | modules/business/business.controller.js | ⬜ Pending |
| BusinessService.php | modules/business/business.service.js | ⬜ Pending |
| Business.php | modules/business/business.model.js | ⬜ Pending |

**Endpoints:**
- GET /api/business
- POST /api/business
- GET /api/business/{id}
- PUT /api/business/{id}
- DELETE /api/business/{id}
- GET /api/business/{businessId}/sub-businesses
- GET /api/getNumber/{businessId}
- GET /api/admin/business-stats (admin)

---

### 4. PRODUCTS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| ProductController.php | modules/products/product.controller.js | ⬜ Pending |
| ProductService.php | modules/products/product.service.js | ⬜ Pending |
| Product.php | modules/products/product.model.js | ⬜ Pending |
| StoreRequest.php | modules/products/product.validation.js | ⬜ Pending |
| UpdateRequest.php | modules/products/product.validation.js | ⬜ Pending |

**Endpoints:**
- GET /api/products
- POST /api/products
- GET /api/products/{id}
- PUT /api/products/{id}
- DELETE /api/products/{id}
- GET /api/all-products/{businessId}
- GET /api/all-products/{businessId}/admin
- GET /api/random-products
- GET /api/business/{businessId}/products
- GET /api/businessTypes/{businessId}
- GET /api/products/{businessId}/filtered
- POST /api/product/{id}/status
- DELETE /api/delete-products/{businessId}
- POST /api/update-grocery-business-id
- GET /api/restaurantAdmin/allproducts (restaurant_admin)
- POST /api/restaurantAdmin/products/discount (restaurant_admin)
- GET /api/restaurantAdmin/products/removeDiscount (restaurant_admin)
- POST /api/restaurantAdmin/add-products (restaurant_admin)
- POST /api/restaurantAdmin/products/{productId}/apply-discount (restaurant_admin)
- PATCH /api/restaurantAdmin/products/{product}/toggle-active (restaurant_admin)

---

### 5. ORDERS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| OrderController.php | modules/orders/order.controller.js | ⬜ Pending |
| OrderManageService.php | modules/orders/order.service.js | ⬜ Pending |
| Order.php | modules/orders/order.model.js | ⬜ Pending |
| OrderItem.php | modules/orders/orderItem.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/order (auth)
- GET /api/order (auth)
- GET /api/orders/{id}
- PUT /api/orders/{id}/status
- POST /api/reorder/{order} (auth)
- DELETE /api/orders/delete-all
- GET /api/restaurantAdmin/orders (restaurant_admin)
- GET /api/admin/business-orders/{id} (admin)
- GET /api/admin/grocery/{id} (admin)

---

### 6. CART MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| CartController.php | modules/cart/cart.controller.js | ⬜ Pending |
| CartService.php | modules/cart/cart.service.js | ⬜ Pending |
| cart.php | modules/cart/cart.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/cart (auth)
- GET /api/cart (auth)
- DELETE /api/cart/{id} (auth)
- DELETE /api/cart/product/{id} (auth)
- PATCH /api/cart/update/{id} (auth)
- GET /api/cart/item-count (auth)

---

### 7. VOUCHERS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| VoucherController.php | modules/vouchers/voucher.controller.js | ⬜ Pending |
| Voucher.php | modules/vouchers/voucher.model.js | ⬜ Pending |
| VoucherUsage.php | modules/vouchers/voucherUsage.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/cart/apply-voucher (auth)
- POST /api/admin/create-voucher (admin)
- GET /api/admin/get-voucher (admin)
- DELETE /api/admin/voucher/{id}/delete (admin)

---

### 8. REVIEWS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| ReviewController.php | modules/reviews/review.controller.js | ⬜ Pending |
| Review.php | modules/reviews/review.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/reviews (auth)
- GET /api/reviews/{business_id} (auth)
- GET /api/restaurantAdmin/get-reviews (restaurant_admin)
- POST /api/restaurantAdmin/review/{review_id}/reply (restaurant_admin)

---

### 9. COMPLAINTS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| ComplainController.php | modules/complaints/complaint.controller.js | ⬜ Pending |
| complainService.php | modules/complaints/complaint.service.js | ⬜ Pending |
| Complaint.php | modules/complaints/complaint.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/complaints (auth)
- PUT /api/restaurantAdmin/complaint-status (restaurant_admin)
- GET /api/restaurantAdmin/complaints (restaurant_admin)

---

### 10. TOWNS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| TownController.php | modules/towns/town.controller.js | ⬜ Pending |
| TownService.php | modules/towns/town.service.js | ⬜ Pending |
| Town.php | modules/towns/town.model.js | ⬜ Pending |

**Endpoints:**
- GET /api/towns
- POST /api/towns
- PUT /api/towns/{id}
- DELETE /api/towns/{id}
- GET /api/get-towns (auth)

---

### 11. HOUSEHOLDS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| HouseholdController.php | modules/households/household.controller.js | ⬜ Pending |
| Household.php | modules/households/household.model.js | ⬜ Pending |

**Endpoints:**
- PUT /api/update/household

---

### 12. HEADER IMAGES MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| HeaderImageController.php | modules/header-images/headerImage.controller.js | ⬜ Pending |
| HeaderImage.php | modules/header-images/headerImage.model.js | ⬜ Pending |

**Endpoints:**
- GET /api/header-images
- POST /api/header-images
- PUT /api/header-images/{id}
- DELETE /api/header-images/{id}
- POST /api/header-images/reorder

---

### 13. EASY BUY MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| EasyBuyController.php | modules/easy-buy/easyBuy.controller.js | ⬜ Pending |
| EasyBuyService.php | modules/easy-buy/easyBuy.service.js | ⬜ Pending |
| EasyBuy.php | modules/easy-buy/easyBuy.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/easy-buy
- GET /api/easy-buy
- GET /api/easy-buy/{id}
- PUT /api/easy-buy/{id}
- DELETE /api/easy-buy/{id}
- POST /api/resolve-product
- POST /api/easy-buy/filters

---

### 14. PRESCRIPTIONS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| PerscriptionController.php | modules/prescriptions/prescription.controller.js | ⬜ Pending |
| Perscription.php | modules/prescriptions/prescription.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/prescription (auth)

---

### 15. POS PRODUCTS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| PosProductController.php | modules/pos-products/posProduct.controller.js | ⬜ Pending |
| PosProduct.php | modules/pos-products/posProduct.model.js | ⬜ Pending |
| ImportPosProductsJob.php | modules/pos-products/posProduct.service.js | ⬜ Pending |
| PosProductImporter.php | modules/pos-products/posProduct.importer.js | ⬜ Pending |

**Endpoints:**
- GET /api/pos-products
- POST /api/pos-products/import

---

### 16. GROCERY PRODUCTS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| GroceryProductController.php | modules/grocery/grocery.controller.js | ⬜ Pending |
| GroceryProduct.php | modules/grocery/grocery.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/import-grocery-products

---

### 17. INTERNSHIP APPLICATIONS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| InternshipApplicationController.php | modules/internship/internship.controller.js | ⬜ Pending |
| InternshipApplication.php | modules/internship/internship.model.js | ⬜ Pending |

**Endpoints:**
- POST /api/internship/apply (auth)
- GET /api/admin/internship-applications (admin)

---

### 18. NOTIFICATIONS & EVENTS MODULE

| Laravel Files | Node.js Equivalent | Status |
|---------------|-------------------|--------|
| OrderPlaced.php (Event) | modules/events/orderPlaced.event.js | ⬜ Pending |
| OrderNotification.php | modules/notifications/order.notification.js | ⬜ Pending |
| BroadcastServiceProvider.php | config/websocket.js | ⬜ Pending |

---

## SHARED INFRASTRUCTURE

| Laravel | Node.js Equivalent | Status |
|---------|-------------------|--------|
| ResponseController.php | utils/api-response.js | ⬜ Pending |
| ImageService.php | utils/file-upload.js | ⬜ Pending |
| AdminMiddleware.php | middleware/admin.middleware.js | ⬜ Pending |
| TownAdminMiddleware.php | middleware/restaurantAdmin.middleware.js | ⬜ Pending |
| auth:sanctum | middleware/auth.middleware.js | ⬜ Pending |
| Form Requests | middleware/validation.middleware.js | ⬜ Pending |
| DatabaseSeeder.php | seeds/index.js | ⬜ Pending |

---

## MONGODB COLLECTION MAPPING

| Laravel Model | MongoDB Collection | Key Fields |
|--------------|-------------------|------------|
| User | users | phone_no (unique), role, points, household_id, town_id, business_id |
| Town | towns | town_name |
| Household | households | address, town_id (ref) |
| Business | businesses | name, type, image, parent_id (ref self), status, discount |
| Product | products | title, type, price, business_id (ref), discount, is_active, easy_buy_id |
| Cart | carts | user_id (ref), product_id (ref), quantity |
| Order | orders | user_id (ref), total_price, status, voucher_id (ref) |
| OrderItem | order_items | order_id (ref), product_id (ref), price, quantity |
| Review | reviews | user_id, business_id, order_id, rating, comments, reply |
| Voucher | vouchers | business_id, code (unique), discount_amount, expiry_date, min_purchase_amount |
| Complaint | complaints | user_id, household_id, town_id, title, description, status |
| HeaderImage | header_images | image_path, order, is_active |
| EasyBuy | easy_buys | title, business_id, image, payload (JSON) |
| Perscription | prescriptions | user_id, order_id, product_id, image_url, status |
| PosProduct | pos_products | item_code+locno (unique compound), name, price, quantity |
| GroceryProduct | grocery_products | title, price, business_id |
| InternshipApplication | internship_applications | full_name, email, phone |
| Notification | notifications | user_id, type, data, read_at |

---

## VALIDATION RULES SUMMARY

| Field | Rules |
|-------|-------|
| phone_no | required, string, min:11, max:11, unique (register) |
| password | required, string, min:4 |
| name | required, string, max:255 |
| town | required, string, max:255 |
| address | required, string, max:255 |
| image | nullable, file, max:2MB, mimes: png,jpg,jpeg,svg,gif |
| title | required, string, max:255 |
| description | required, string |
| price | required, string/numeric |
| type | required, string |
| quantity | required, integer, min:1 |
| product_id | required, exists in products |
| business_id | required, exists in businesses |
| status | required, in: pending,preparing,delivered,cancelled |
| voucher code | required, string, min:4, max:12 |
| discount | required, numeric, min:0 |
| discount_type | required, in: percentage,flat |

---

## FEATURES TO IMPLEMENT

- [x] Migration checklist created
- [ ] Project setup (package.json, folder structure)
- [ ] Database config (MongoDB connection)
- [ ] All Mongoose models (18 models)
- [ ] Auth module (register, login, profile, add-details)
- [ ] JWT middleware (replace Sanctum)
- [ ] Role middleware (admin, restaurant_admin)
- [ ] Validation middleware (Joi/Zod)
- [ ] API response helper
- [ ] File upload (multer + base64)
- [ ] Business CRUD
- [ ] Products CRUD + search/filter/pagination
- [ ] Cart CRUD
- [ ] Order placement + business logic
- [ ] Voucher system
- [ ] Reviews
- [ ] Complaints
- [ ] Towns & Households
- [ ] Header Images
- [ ] EasyBuy system
- [ ] Prescriptions
- [ ] POS Products import
- [ ] Grocery import
- [ ] Internship applications
- [ ] WebSocket events (Pusher/Socket.io)
- [ ] Notifications
- [ ] Seeders
- [ ] Health endpoint
- [ ] Error handling
- [ ] Data migration scripts
