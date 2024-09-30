import { createRouter, createWebHistory } from "vue-router";

// User Pages
import Splash from "../pages/Splash.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import RegisterComplete from "../pages/RegisterComplete.vue";
import Categories from "../pages/Categories.vue";
import Cart from "../pages/Cart.vue";
import OrderNow from "../pages/OrderNow.vue";
import CategoryPage from "../pages/CategoryPage.vue";
import ProductDetailsPage from "../pages/ProductDetailPage.vue";
import UserLayout from "../layout/UserLayout.vue";
import Services from "../pages/Services.vue";

// Admin Pages
import AdminLayout from "../layout/AdminLayout.vue";
import Login from "../pages/Admin/Login.vue";
import Dashboard from "../pages/Admin/Dashboard.vue";
import Product from "../pages/Admin/Products.vue";
import UserAdmin from "../pages/Admin/User.vue";
import RegisterAdmin from "../pages/Admin/RegisterAdmin.vue";
import RestaurantAdminDashboard from "../pages/RestaurantAdmin/RestaurantAdminDashboard.vue";
import RestaurantOrder from "../pages/RestaurantAdmin/RestaurantOrder.vue";
import Profile from "../pages/Profile.vue";
import OrderHistory from "../pages/OrderHistory.vue";
import UserLogin from "../pages/Login.vue";
import ForgotPassword from "../pages/ForgotPassword.vue";
import SearchProduct from "../pages/SearchProduct.vue";
import Discount from "../pages/RestaurantAdmin/Discount.vue";
import StoreProduct from "../components/Vendor/StoreProduct.vue";
import ViewAdmins from "../components/ViewAdmins.vue";
import ShopStats from "../pages/Admin/ShopStats.vue";

const routes = [
  {
    path: "/",
    name: "TownService",
    component: Splash,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (token) {
        next({ name: "Categories" });
      } else {
        next();
      }
    },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");
      if (token) {
        next({ name: "Categories" });
      } else {
        next();
      }
    },
  },
  {
    path: "/userlogin",
    name: "UserLogin",
    component: UserLogin,
  },
  {
    path: "/forgotpassword",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/compregister",
    name: "compRegister",
    component: RegisterComplete,
  },

  // User Routes
  {
    path: "/home",
    name: "Home",
    component: UserLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "categories",
        name: "Categories",
        component: Categories,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "search",
        name: "Search",
        component: SearchProduct,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "category/:id",
        name: "CategoryPage",
        component: CategoryPage,
        props: (route) => ({
          id: route.params.id,
          categoryTitle: route.query.title,
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "product/:id",
        name: "ProductDetailsPage",
        component: ProductDetailsPage,
        props: (route) => ({
          id: route.params.id,
        }),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "cart",
        name: "Cart",
        component: Cart,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "order",
        name: "OrderNow",
        component: OrderNow,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "services",
        name: "Services",
        component: Services,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "orderconfirmation",
        name: "Orderconfirmation",
        component: OrderNow,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "profile",
        name: "UserProfile",
        component: Profile,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "vieworders",
        name: "ViewOrders",
        component: OrderHistory,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    name: "AdminLogin",
    component: Login,
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: {
      requiresAdminAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "products/:id",
        name: "Products",
        component: Product,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "users",
        name: "Users",
        component: UserAdmin,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "vendors",
        name: "Vendors",
        component: ViewAdmins,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "stats",
        name: "Stats",
        component: ShopStats,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "restaurantAdmin",
        name: "RestaurantAdmin",
        component: RegisterAdmin,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "restaurantOrders",
        name: "RestaurantOrders",
        component: RestaurantOrder,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "restaurantAdminDashboard",
        name: "RestaurantAdminDashboard",
        component: RestaurantAdminDashboard,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "discount",
        name: "Discount",
        component: Discount,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "store-product",
        name: "Store-Product",
        component: StoreProduct,
        meta: {
          requiresAdminAuth: true,
        },
      },
      {
        path: "profile",
        name: "AdminProfile",
        component: Profile,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth) {
    if (token) {
      if (role === "admin") {
        next();
      } else if (role === "restaurant_admin") {
        if (to.meta.requiresAdminAuth) {
          next();
        } else {
          if (
            to.name !== "RestaurantOrders" &&
            to.name !== "RestaurantAdminDashboard"
          ) {
            next({ name: "RestaurantOrders" });
          } else {
            next();
          }
        }
      } else {
        next();
      }
    } else {
      next({ name: "UserLogin" });
    }
  } else if (to.meta.requiresAdminAuth) {
    if (token) {
      if (role === "admin") {
        next(); // Allow admin access
      } else if (role === "restaurant_admin") {
        next(); // Allow restaurant_admin to access any route that requires admin auth
      } else {
        next({ name: "AdminLogin" }); // Redirect to AdminLogin if the role doesn't match
      }
    } else {
      next({ name: "AdminLogin" }); // Redirect to AdminLogin if no token
    }
  } else {
    // Check if the user is already logged in when accessing login/register pages
    if (token && (to.name === "UserLogin" || to.name === "Register")) {
      next({ name: "Categories" }); // Redirect to Categories if already logged in
    } else {
      next(); // Allow access to public routes
    }
  }
});

export default router;
