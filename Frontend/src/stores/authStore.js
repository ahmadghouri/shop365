import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { toast } from "vue3-toastify";
import { useOrderStore } from "../store/orderStore";
import { useCartStore } from "../store/cartStore";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const role = ref(null);
  const points = ref(0);

  // Initialize state from localStorage
  const initializeStore = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setLoginData(storedToken, JSON.parse(storedUser));
    }
  };

  // Login action
  const login = async (phone_no, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        phone_no,
        password,
      });

      console.log("Login successful", response.data);

      const { token: newToken, data } = response.data;

      // Set login data first
      await setLoginData(newToken, data);
      // After successful login, migrate guest cart if exists
      const cartStore = useCartStore();
      await cartStore.migrateGuestCart();

      return {
        success: true,
        role: data.role,
      };
    } catch (error) {
      console.log("Login error:", error.response?.data);

      return {
        success: false,
        errors: error.response?.data?.errors || {},
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  // Logout action
  const logout = () => {
    const cartStore = useCartStore();
    cartStore.isGuest = true; // Reset cart store to guest mode
    cartStore.cartItems = []; // Clear cart items
    cartStore.cartCount = 0;
    cartStore.voucherDiscount = 0;

    setLoginData(null, null);
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/refreshUser`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      points.value = response.data.user.points;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        errors: error.response?.data?.errors || {},
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const setLoginData = (tokenValue = null, userValue = null) => {
    const roleValue = userValue?.role;
    const businessId = userValue?.business_id || user.value?.business_id;

    // Update state
    token.value = tokenValue;
    user.value = userValue;
    role.value = roleValue;

    if (tokenValue) {
      // Persist to localStorage
      localStorage.setItem("token", tokenValue);
      localStorage.setItem("user", JSON.stringify(userValue));
      localStorage.setItem("role", roleValue);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;

      // const cartStore = useCartStore();
      // cartStore.isGuest = false;

      // set business events
      if (businessId) {
        setTimeout(() => {
          registerBusinessEvents(businessId);
        }, 5000);
      }
    } else {
      // unset events
      if (businessId) {
        removeBusinessEvents(businessId);
      }

      // unset axios default header
      delete axios.defaults.headers.common["Authorization"];

      // Remove persisted data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  };

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!token.value;
  });

  const registerBusinessEvents = async (businessId) => {
    console.log("Registering business events for businessId:", businessId);
    const orderStore = useOrderStore();
    const { handleNewOrder } = orderStore;

    const channelName = "order-channel." + businessId;

    if (window.Echo && !window.Echo.connector.channels[channelName]) {
      const notificationAudio = new Audio("/notification.mp3");
      notificationAudio.volume = 1;

      const playNotificationSound = () => {
        notificationAudio.play().catch((error) => {
          console.warn("Audio playback failed:", error);
        });
      };

      // Request notification permission if not yet granted
      if (
        typeof Notification !== "undefined" &&
        Notification?.permission === "default"
      ) {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
      }

      window.Echo.channel(channelName)
        .listen("OrderPlaced", (event) => {
          handleNewOrder(event);
          console.log(event);
          playNotificationSound();

          if (navigator?.vibrate) {
            navigator.vibrate(1000);
          }

          const orderTitle = "New Order Received";
          const orderMessage = `You have received a new order from ${
            event?.user?.name || "Shop365"
          }`;

          window?.cordovaApp?.showPushNotification(orderTitle, orderMessage);

          if (
            typeof Notification !== "undefined" &&
            Notification?.permission === "granted"
          ) {
            new Notification(orderTitle, {
              body: `You have received a new order from ${
                event.user?.name || "Shop365"
              }`,
              icon: "/Appicon.png",
            });
          } else {
            console.warn(
              "Push notifications are not enabled or permission denied"
            );
          }
        })
        .error((error) => {
          console.error("Echo error:", error);
        });
    } else {
      console.log(
        "Echo instance is not defined or channel is already subscribed"
      );
    }
  };

  const removeBusinessEvents = (businessId) => {
    if (window.Echo) {
      window.Echo.leaveChannel("order-channel." + businessId);
    }
  };

  return {
    user,
    token,
    role,
    login,
    logout,
    refreshUser,
    points,
    isAuthenticated,
    initializeStore,
  };
});
