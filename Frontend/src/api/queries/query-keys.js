/**
 * Centralized query keys for cache invalidation
 */
export const QUERY_KEYS = {
  // Auth
  PROFILE: ["profile"],
  REFRESH_USER: ["refreshUser"],

  // Categories
  CATEGORIES: ["categories"],
  CATEGORY: (id) => ["category", id],

  // Business
  BUSINESSES: ["businesses"],
  BUSINESS: (id) => ["business", id],
  SUB_BUSINESSES: (id) => ["subBusinesses", id],
  BUSINESS_STATS: ["businessStats"],

  // Products
  PRODUCTS: (params) => ["products", params],
  PRODUCT: (id) => ["product", id],
  BUSINESS_PRODUCTS: (businessId, params) => ["businessProducts", businessId, params],
  BUSINESS_PRODUCTS_ADMIN: (businessId, params) => ["businessProductsAdmin", businessId, params],
  RANDOM_PRODUCTS: ["randomProducts"],
  PRODUCT_TYPES: (businessId) => ["productTypes", businessId],
  RESTAURANT_PRODUCTS: (params) => ["restaurantProducts", params],

  // Cart
  CART: ["cart"],
  CART_ITEM_COUNT: ["cartItemCount"],

  // Orders
  ORDERS: ["orders"],
  ORDER: (id) => ["order", id],
  RESTAURANT_ORDERS: (params) => ["restaurantOrders", params],
  ADMIN_BUSINESS_ORDERS: (id) => ["adminBusinessOrders", id],
  GROCERY_USERS: (id) => ["groceryUsers", id],

  // Towns
  TOWNS: ["towns"],

  // Reviews
  REVIEWS: (businessId) => ["reviews", businessId],
  RESTAURANT_REVIEWS: ["restaurantReviews"],

  // Vouchers
  VOUCHERS: ["vouchers"],

  // Complaints
  COMPLAINTS: ["complaints"],
  RESTAURANT_COMPLAINTS: ["restaurantComplaints"],

  // Header Images
  HEADER_IMAGES: ["headerImages"],

  // EasyBuy
  EASY_BUYS: ["easyBuys"],
  EASY_BUY: (id) => ["easyBuy", id],

  // Users
  ADMIN_USERS: (params) => ["adminUsers", params],
  ADMIN_USER: (id) => ["adminUser", id],
  ADMIN_RECENT_USERS: ["adminRecentUsers"],
  ADMIN_VENDORS: ["adminVendors"],

  // POS Products
  POS_PRODUCTS: (params) => ["posProducts", params],

  // Internship
  INTERNSHIP_APPS: ["internshipApps"],
};
