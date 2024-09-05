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

const routes = [
  // Public Routes
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
        path: "orderconfirmation",
        name: "Orderconfirmation",
        component: OrderNow,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "profile",
        name: "Profile",
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
      // If authenticated, allow access
      if (to.meta.requiresAdminAuth) {
        if (role === "admin") {
          next(); // Allow access for admin
        } else if (role === "restaurant_admin") {
          if (
            to.name === "RestaurantAdminDashboard" ||
            to.name === "RestaurantOrders"
          ) {
            next(); // Allow access for restaurant_admin to specific routes
          } else {
            next({ name: "RestaurantAdminDashboard" }); // Redirect to RestaurantAdminDashboard if accessing other routes
          }
        } else {
          next({ name: "AdminLogin" }); // Redirect to AdminLogin if the role is not valid
        }
      } else {
        next(); // Allow access for non-admin routes
      }
    } else {
      next({ name: "UserLogin" }); // Redirect to UserLogin if not authenticated
    }
  } else {
    next(); // Allow access for routes that do not require authentication
  }
});

export default router;
