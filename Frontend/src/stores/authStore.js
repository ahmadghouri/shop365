import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import { toast } from "vue3-toastify";
import { useOrderStore } from '../store/orderStore';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const token = ref(null)
    const role = ref(null)

    // Initialize state from localStorage
    const initializeStore = () => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setLoginData(storedToken, JSON.parse(storedUser))
        }
    }

    // Login action
    const login = async (phone_no, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                phone_no,
                password
            })

            console.log('Login successful', response.data)

            const { token: newToken, data } = response.data

            setLoginData(newToken, data)

            console.log('Login successful', data, role.value)

            return {
                success: true,
                role: data.role
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Invalid credentials'
            }
        }
    }

    // Logout action
    const logout = () => {
        setLoginData(null, null)
    }

    const setLoginData = (tokenValue = null, userValue = null) => {
        const roleValue = userValue?.role
        const businessId = userValue?.business_id || user.value?.business_id

        // Update state
        token.value = tokenValue
        user.value = userValue
        role.value = roleValue

        if (tokenValue) {
            // Persist to localStorage
            localStorage.setItem('token', tokenValue)
            localStorage.setItem('user', JSON.stringify(userValue))
            localStorage.setItem('role', roleValue)

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`

            // set business events
            if (businessId) {
                setTimeout(() => {
                    registerBusinessEvents(businessId)
                }, 5000)
            }

        } else {
            // unset events
            if (businessId) {
                removeBusinessEvents(businessId)
            }

            // unset axios default header
            delete axios.defaults.headers.common['Authorization']

            // Remove persisted data from localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('role')

        }
    }

    // Check if user is authenticated
    const isAuthenticated = computed(() => {
        return !!token.value
    })

    const registerBusinessEvents = async (businessId) => {
        console.log('Registering business events for businessId:', businessId)
        const orderStore = useOrderStore()
        const { handleNewOrder } = orderStore;

        const notificationAudio = new Audio("/notification.mp3");
        notificationAudio.volume = 1;

        const playNotificationSound = () => {
            notificationAudio.play().catch((error) => {
                console.warn("Audio playback failed:", error);
            });
        };

        // Request notification permission if not yet granted
        if (typeof Notification !== "undefined" && Notification?.permission === "default") {
            const permission = await Notification.requestPermission();
            console.log("Notification permission:", permission);
        }

        if (window.Echo) {
            window.Echo.channel("order-channel." + businessId)
                .listen("OrderPlaced", (event) => {
                    handleNewOrder(event)
                    playNotificationSound();

                    const orderTitle = "New Order Received";
                    const orderMessage = `You have received a new order from ${event?.user?.name || "Shop365"}`;

                    window?.cordovaApp?.showPushNotification(orderTitle, orderMessage);

                    if (typeof Notification !== "undefined" && Notification?.permission === "granted") {
                        new Notification(orderTitle, {
                            body: `You have received a new order from ${event.user?.name || "Shop365"
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
            console.error("Echo instance is not defined");
        }

    }

    const removeBusinessEvents = (businessId) => {
        if (window.Echo) {
            window.Echo.leaveChannel("order-channel." + businessId);
        }
    }

    return {
        user,
        token,
        role,
        login,
        logout,
        isAuthenticated,
        initializeStore
    }
})
