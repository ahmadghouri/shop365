import './global.css';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { SplashScreen } from './components/SplashScreen';
import { LocationPermissionScreen } from './components/LocationPermissionScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { FloatingCartBar } from './components/FloatingCartBar';
import { BottomTabBar } from './components/home/BottomTabBar';
import { HomePage } from './pages/HomePage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { BackendProductDetailPage } from './pages/BackendProductDetailPage';
import { CartPage } from './pages/CartPage';
import { MonthlyGroceryPage } from './pages/MonthlyGroceryPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { useAuthStore } from './lib/authStore';
import { useCartStore } from './lib/cartStore';

// Screens where the bottom tab bar should be visible
const TAB_SCREENS = ['home', 'cart', 'monthly', 'orders', 'profile'];

function AppContent() {
  const [screen, setScreen] = useState('Splash');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showCheckout, setShowCheckout] = useState(false);
  const [monthlyReturnToCart, setMonthlyReturnToCart] = useState(false);
  const [cartSelectedCardId, setCartSelectedCardId] = useState('');
  const { isAuthenticated, loadToken } = useAuthStore();
  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => { loadToken(); }, []);
  useEffect(() => { if (isAuthenticated) loadCart(); }, [isAuthenticated]);
  useEffect(() => {
    if (screen === 'Splash') {
      const timer = setTimeout(() => setScreen('Location'), 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const navigateForward = useCallback((target) => setScreen(target), []);
  const navigateBack = useCallback((target) => setScreen(target), []);

  if (screen === 'Splash') {
    return <View style={{ flex: 1 }}><SplashScreen /></View>;
  }

  if (isAuthenticated) {
    // Sub-screens — no tabbar
    if (showCheckout) {
      return (
        <View style={{ flex: 1 }}>
          <CheckoutPage
            onBack={() => setShowCheckout(false)}
            onSuccess={() => { setShowCheckout(false); setActiveTab('cart'); }}
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
            onBuyNow={() => { setActiveProduct(null); setActiveTab('cart'); }}
          />
          <FloatingCartBar onPress={() => { setActiveProduct(null); setActiveTab('cart'); }} bottom={104} />
        </View>
      );
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
            onCartPress={() => { setActiveCategory(null); setActiveTab('cart'); }}
          />
          <FloatingCartBar onPress={() => { setActiveCategory(null); setActiveTab('cart'); }} />
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
              onCheckout={() => setShowCheckout(true)}
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
              onGoToCart={() => { setMonthlyReturnToCart(false); setActiveTab('cart'); }}
            />
          );
        case 'orders':
          return <OrderHistoryPage onBack={() => setActiveTab('home')} />;
        case 'profile':
          return (
            <ProfilePage
              onLogout={() => setActiveTab('home')}
              onBack={() => setActiveTab('home')}
              onOrderHistory={() => setActiveTab('orders')}
            />
          );
        default: // home
          return (
            <HomePage
              onCategoryPress={(category) => setActiveCategory(category)}
              onProductPress={(product) => setActiveProduct(product)}
              onCartPress={() => setActiveTab('cart')}
              onListPress={() => { setMonthlyReturnToCart(false); setActiveTab('list'); }}
              onOrdersPress={() => setActiveTab('orders')}
              onProfilePress={() => setActiveTab('profile')}
            />
          );
      }
    };

    return (
      <View style={{ flex: 1 }}>
        {renderTab()}
        {activeTab !== 'cart' && (
          <BottomTabBar
            activeTab={activeTab}
            onHomePress={() => setActiveTab('home')}
            onListPress={() => setActiveTab('list')}
            onOrdersPress={() => setActiveTab('orders')}
            onProfilePress={() => setActiveTab('profile')}
          />
        )}
        {activeTab === 'home' && (
          <FloatingCartBar onPress={() => setActiveTab('cart')} bottom={88} />
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
          <RegisterScreen
            onSuccess={() => {}}
            onLogin={() => navigateBack('Login')}
          />
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
        return <WelcomeScreen onRegister={() => navigateForward('Register')} onLogin={() => navigateForward('Login')} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
