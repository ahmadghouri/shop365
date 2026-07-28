import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authApi } from "@/api/modules/auth.api";
import { useOrderStore } from "../store/orderStore";
import { useCartStore } from "../store/cartStore";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const role = ref(null);
  const points = ref(0);

  const initializeStore = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setLoginData(storedToken, JSON.parse(storedUser));
    }
  };

  const login = async (phone_no, password) => {
    try {
      const response = await authApi.login({ phone_no, password });
      const { token: newToken, data } = response.data;

      setLoginData(newToken, data);

      const cartStore = useCartStore();
      await cartStore.migrateGuestCart();

      return { success: true, role: data.role };
    } catch (error) {
      return {
        success: false,
        errors: error.response?.data?.errors || {},
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const logout = () => {
    const cartStore = useCartStore();
    cartStore.isGuest = true;
    cartStore.cartItems = [];
    cartStore.cartCount = 0;
    cartStore.voucherDiscount = 0;
    setLoginData(null, null);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.refreshUser();
      points.value = response.data.user?.points || response.data.data?.points || 0;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to refresh",
      };
    }
  };

  const setLoginData = (tokenValue = null, userValue = null) => {
    const roleValue = userValue?.role;
    const businessId = userValue?.business_id || user.value?.business_id;

    token.value = tokenValue;
    user.value = userValue;
    role.value = roleValue;

    if (tokenValue) {
      localStorage.setItem("token", tokenValue);
      localStorage.setItem("user", JSON.stringify(userValue));
      localStorage.setItem("role", roleValue);

      if (businessId) {
        setTimeout(() => registerBusinessEvents(businessId), 5000);
      }
    } else {
      if (businessId) removeBusinessEvents(businessId);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  };

  const isAuthenticated = computed(() => !!token.value);

  const registerBusinessEvents = async (businessId) => {
    const orderStore = useOrderStore();
    const { handleNewOrder } = orderStore;
    const channelName = "order-channel." + businessId;

    if (window.Echo && !window.Echo.connector.channels[channelName]) {
      const notificationAudio = new Audio("/notification.mp3");
      notificationAudio.volume = 1;

      const playNotificationSound = () => {
        notificationAudio.play().catch(() => {});
      };

      if (typeof Notification !== "undefined" && Notification?.permission === "default") {
        await Notification.requestPermission();
      }

      window.Echo.channel(channelName)
        .listen("OrderPlaced", (event) => {
          handleNewOrder(event);
          playNotificationSound();
          if (navigator?.vibrate) navigator.vibrate(1000);

          const orderTitle = "New Order Received";
          const orderMessage = `You have received a new order from ${event?.user?.name || "Shop365"}`;

          window?.cordovaApp?.showPushNotification(orderTitle, orderMessage);

          if (typeof Notification !== "undefined" && Notification?.permission === "granted") {
            new Notification(orderTitle, {
              body: orderMessage,
              icon: "/Appicon.png",
            });
          }
        })
        .error((error) => console.error("Echo error:", error));
    }
  };

  const removeBusinessEvents = (businessId) => {
    if (window.Echo) window.Echo.leaveChannel("order-channel." + businessId);
  };

  return {
    user, token, role, login, logout, refreshUser, points, isAuthenticated, initializeStore,
  };
});
