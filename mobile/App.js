import './global.css';
import { StatusBar, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PortalHost } from '@rn-primitives/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { queryClient } from './lib/queryClient';
import { SplashScreen } from './components/SplashScreen';
import { LocationPermissionScreen } from './components/LocationPermissionScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { FloatingCartBar } from './components/FloatingCartBar';
import { BottomTabBar } from './components/home/BottomTabBar';
import {
    connectSocket,
    disconnectSocket,
    setSecurityNotificationHandler,
} from './lib/socketService';
import { HomePage } from './pages/HomePage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { BackendProductDetailPage } from './pages/BackendProductDetailPage';
import { CartPage } from './pages/CartPage';
import { MonthlyGroceryPage } from './pages/MonthlyGroceryPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { SecurityPage } from './components/security/SecurityPage';
import { ThemePage } from './pages/ThemePage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { NotificationPage } from './pages/NotificationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { useAuthStore } from './lib/authStore';
import { useCartStore } from './lib/cartStore';
import { useNotificationStore } from './lib/notificationStore';
import { fetchNotifications, toLocalNotifications } from './api/notifications/notification.service';
import {
    registerForPushNotificationsAsync,
    registerPushToken,
    setupPushNotificationListeners,
} from './lib/pushNotifications';

// Screens where the bottom tab bar should be visible
const TAB_SCREENS = ['home', 'cart', 'monthly', 'orders', 'profile'];

function AppContent() {
    const [screen, setScreen] = useState('Splash');
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeProduct, setActiveProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [showCheckout, setShowCheckout] = useState(false);
    const [excludedOrderVendorIds, setExcludedOrderVendorIds] = useState([]);
    const [monthlyReturnToCart, setMonthlyReturnToCart] = useState(false);
    const [isPackageCartOpen, setIsPackageCartOpen] = useState(false);
    const [cartSelectedCardId, setCartSelectedCardId] = useState('');
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showTheme, setShowTheme] = useState(false);
    const { isAuthenticated, loadToken } = useAuthStore();
    const loadCart = useCartStore((s) => s.loadCart);
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;
    const cartBottomHome = isUltraTinyScreen ? 68 : isTinyScreen ? 72 : isSmallScreen ? 78 : 88;
    const cartBottomDetail = isUltraTinyScreen ? 84 : isTinyScreen ? 88 : isSmallScreen ? 94 : 104;

    useEffect(() => {
        loadToken();
    }, []);
    useEffect(() => {
        if (isAuthenticated) {
            loadCart();
            const token = useAuthStore.getState().token;
            if (token) connectSocket(token);
            registerForPushNotificationsAsync()
                .then((pushToken) => pushToken && registerPushToken(pushToken))
                .catch((error) => console.warn('Push token registration failed', error));
            fetchNotifications(1, 20)
                .then((res) =>
                    useNotificationStore.getState().setNotifications(toLocalNotifications(res.data))
                )
                .catch(() => {});
        } else {
            disconnectSocket();
            setShowSecurity(false);
            setActiveTab('home');
        }
    }, [isAuthenticated]);
    useEffect(
        () =>
            setupPushNotificationListeners((data) => {
                if (!useAuthStore.getState().isAuthenticated) return;
                if (data?.type === 'security') {
                    setShowSecurity(true);
                } else {
                    setActiveTab('notifications');
                }
            }),
        []
    );

    // Live socket security notifications → open SecurityPage immediately
    useEffect(() => {
        setSecurityNotificationHandler(() => {
            if (!useAuthStore.getState().isAuthenticated) return;
            setShowSecurity(true);
        });
    }, []);
    useEffect(() => {
        if (screen === 'Splash') {
            const timer = setTimeout(async () => {
                try {
                    const { status } = await Location.getForegroundPermissionsAsync();
                    const onboarded = await AsyncStorage.getItem('location_onboarded');
                    if (status === 'granted' || onboarded === '1') {
                        setScreen('Welcome');
                    } else {
                        setScreen('Location');
                    }
                } catch {
                    setScreen('Location');
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [screen]);

    const navigateForward = useCallback((target) => setScreen(target), []);
    const navigateBack = useCallback((target) => setScreen(target), []);

    if (screen === 'Splash') {
        return (
            <View style={{ flex: 1 }}>
                <SplashScreen />
            </View>
        );
    }

    if (isAuthenticated) {
        // Sub-screens — no tabbar
        if (trackingOrder) {
            return (
                <View style={{ flex: 1 }}>
                    <OrderTrackingPage
                        orderId={trackingOrder._id}
                        initialOrder={trackingOrder}
                        onBack={() => setTrackingOrder(null)}
                    />
                </View>
            );
        }

        if (showCheckout) {
            return (
                <View style={{ flex: 1 }}>
                    <CheckoutPage
                        excludeVendorIds={excludedOrderVendorIds}
                        onBack={() => {
                            setExcludedOrderVendorIds([]);
                            setShowCheckout(false);
                        }}
                        onSuccess={() => {
                            setExcludedOrderVendorIds([]);
                            setShowCheckout(false);
                            setActiveTab('cart');
                        }}
                    />
                </View>
            );
        }

        if (activeProduct) {
            return (
                <View style={{ flex: 1 }}>
                    <BackendProductDetailPage
                        productId={String(activeProduct.id || activeProduct._id)}
                        previewImage={activeProduct.image}
                        onBack={() => setActiveProduct(null)}
                        onAddToCart={() => {}}
                        onBuyNow={() => {
                            setActiveProduct(null);
                            setActiveTab('cart');
                        }}
                    />
                    <FloatingCartBar
                        onPress={() => {
                            setActiveProduct(null);
                            setActiveTab('cart');
                        }}
                        bottom={cartBottomDetail}
                    />
                </View>
            );
        }

        if (showEditProfile) {
            return <EditProfilePage onBack={() => setShowEditProfile(false)} />;
        }

        if (showChangePassword) {
            return <ChangePasswordPage onBack={() => setShowChangePassword(false)} />;
        }

        if (showSecurity) {
            return (
                <SecurityPage
                    onBack={() => setShowSecurity(false)}
                    onLogout={() => setActiveTab('home')}
                />
            );
        }

        if (showTheme) {
            return <ThemePage onBack={() => setShowTheme(false)} />;
        }

        if (activeCategory) {
            return (
                <View style={{ flex: 1 }}>
                    <CategoryDetailPage
                        categoryId={activeCategory.id}
                        title={activeCategory.name}
                        subtitle={activeCategory.subtitle}
                        onBack={() => setActiveCategory(null)}
                        onProductPress={(product) => setActiveProduct(product)}
                        onCartPress={() => {
                            setActiveCategory(null);
                            setActiveTab('cart');
                        }}
                    />
                    <FloatingCartBar
                        onPress={() => {
                            setActiveCategory(null);
                            setActiveTab('cart');
                        }}
                    />
                </View>
            );
        }

        // Main tab screens
        const renderTab = () => {
            switch (activeTab) {
                case 'cart':
                    return (
                        <CartPage
                            onBack={() => setActiveTab('home')}
                            onCheckout={(vendorIds) => {
                                setExcludedOrderVendorIds(vendorIds || []);
                                setShowCheckout(true);
                            }}
                            onMonthlyGrocery={() => {
                                setMonthlyReturnToCart(true);
                                setActiveTab('list');
                            }}
                        />
                    );
                case 'list':
                    return (
                        <MonthlyGroceryPage
                            onBack={() => setActiveTab(monthlyReturnToCart ? 'cart' : 'home')}
                            onGoToCart={() => {
                                setMonthlyReturnToCart(false);
                                setActiveTab('cart');
                            }}
                            onPackageCartChange={setIsPackageCartOpen}
                        />
                    );
                case 'orders':
                    return (
                        <OrderHistoryPage
                            onBack={() => setActiveTab('home')}
                            onTrackOrder={(order) => setTrackingOrder(order)}
                        />
                    );
                case 'profile':
                    return (
                        <ProfilePage
                            onLogout={() => setActiveTab('home')}
                            onBack={() => setActiveTab('home')}
                            onOrderHistory={() => setActiveTab('orders')}
                            onEditProfile={() => setShowEditProfile(true)}
                            onChangePassword={() => setShowChangePassword(true)}
                            onSecurity={() => setShowSecurity(true)}
                            onTheme={() => setShowTheme(true)}
                        />
                    );
                case 'notifications':
                    return (
                        <NotificationPage
                            onBack={() => setActiveTab('home')}
                            onTrackOrder={(orderId) => setTrackingOrder({ _id: orderId })}
                            onSecurity={() => setShowSecurity(true)}
                        />
                    );
                default: // home
                    return (
                        <HomePage
                            onCategoryPress={(category) => setActiveCategory(category)}
                            onProductPress={(product) => setActiveProduct(product)}
                            onCartPress={() => setActiveTab('cart')}
                            onListPress={() => {
                                setMonthlyReturnToCart(false);
                                setActiveTab('list');
                            }}
                            onOrdersPress={() => setActiveTab('orders')}
                            onProfilePress={() => setActiveTab('profile')}
                            onNotificationPress={() => setActiveTab('notifications')}
                        />
                    );
            }
        };

        return (
            <View style={{ flex: 1 }}>
                {renderTab()}
                {activeTab !== 'cart' && !isPackageCartOpen && (
                    <BottomTabBar
                        activeTab={activeTab}
                        onHomePress={() => setActiveTab('home')}
                        onListPress={() => setActiveTab('list')}
                        onOrdersPress={() => setActiveTab('orders')}
                        onProfilePress={() => setActiveTab('profile')}
                    />
                )}
                {activeTab === 'home' && (
                    <FloatingCartBar onPress={() => setActiveTab('cart')} bottom={cartBottomHome} />
                )}
            </View>
        );
    }

    const renderScreen = () => {
        switch (screen) {
            case 'Location':
                return <LocationPermissionScreen onDone={() => navigateForward('Welcome')} />;
            case 'Register':
                return (
                    <RegisterScreen onSuccess={() => {}} onLogin={() => navigateBack('Login')} />
                );
            case 'Login':
                return (
                    <LoginScreen
                        onSuccess={() => {}}
                        onRegister={() => navigateForward('Register')}
                        onForgotPassword={() => console.log('Forgot password')}
                    />
                );
            default:
                return (
                    <WelcomeScreen
                        onRegister={() => navigateForward('Register')}
                        onLogin={() => navigateForward('Login')}
                    />
                );
        }
    };

    return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <PortalHost />
                <AppContent />
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
