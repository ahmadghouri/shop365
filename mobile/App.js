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

function AppContent() {
  const [screen, setScreen] = useState('Splash');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showMonthlyGrocery, setShowMonthlyGrocery] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [monthlyReturnToCart, setMonthlyReturnToCart] = useState(false);
  const { isAuthenticated, loadToken } = useAuthStore();
  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (screen === 'Splash') {
      const timer = setTimeout(() => {
        setScreen('Location');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const navigateForward = useCallback((target) => {
    setScreen(target);
  }, []);

  const navigateBack = useCallback((target) => {
    setScreen(target);
  }, []);

  if (screen === 'Splash') {
    return (
      <View style={{ flex: 1 }}>
        <SplashScreen />
      </View>
    );
  }

  if (isAuthenticated) {
    if (showMonthlyGrocery) {
      return (
        <View style={{ flex: 1 }}>
          <MonthlyGroceryPage
            onBack={() => {
              setShowMonthlyGrocery(false);
              if (monthlyReturnToCart) setShowCart(true);
            }}
            onGoToCart={() => {
              setShowMonthlyGrocery(false);
              setShowCart(true);
            }}
          />
        </View>
      );
    }

    if (showCheckout) {
      return (
        <View style={{ flex: 1 }}>
          <CheckoutPage
            onBack={() => setShowCheckout(false)}
            onSuccess={() => { setShowCheckout(false); setShowCart(false); }}
          />
        </View>
      );
    }

    if (showCart) {
      return (
        <View style={{ flex: 1 }}>
          <CartPage
            onBack={() => setShowCart(false)}
            onCheckout={() => setShowCheckout(true)}
            onMonthlyGrocery={() => {
              setShowCart(false);
              setMonthlyReturnToCart(true);
              setShowMonthlyGrocery(true);
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
            onAddToCart={() => { }}
            onBuyNow={() => setShowCart(true)}
          />
          <FloatingCartBar onPress={() => setShowCart(true)} bottom={104} />
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
            onCartPress={() => setShowCart(true)}
          />
          <FloatingCartBar onPress={() => setShowCart(true)} />
        </View>
      );
    }

    if (showOrderHistory) {
      return (
        <View style={{ flex: 1 }}>
          <OrderHistoryPage onBack={() => setShowOrderHistory(false)} />
        </View>
      );
    }

    if (showProfile) {
      return (
        <View style={{ flex: 1 }}>
          <ProfilePage
            onLogout={() => setShowProfile(false)}
            onBack={() => setShowProfile(false)}
            onOrderHistory={() => { setShowProfile(false); setShowOrderHistory(true); }}
          />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <HomePage
          onCategoryPress={(category) => setActiveCategory(category)}
          onProductPress={(product) => setActiveProduct(product)}
          onCartPress={() => setShowCart(true)}
          onListPress={() => {
            setMonthlyReturnToCart(false);
            setShowMonthlyGrocery(true);
          }}
          onOrdersPress={() => setShowOrderHistory(true)}
          onProfilePress={() => setShowProfile(true)}
        />
        <FloatingCartBar onPress={() => setShowCart(true)} bottom={88} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'Location':
        return (
          <LocationPermissionScreen onDone={() => navigateForward('Welcome')} />
        );
      case 'Register':
        return (
          <RegisterScreen
            onSuccess={() => { }}
            onLogin={() => navigateBack('Login')}
          />
        );
      case 'Login':
        return (
          <LoginScreen
            onSuccess={() => { }}
            onRegister={() => navigateForward('Register')}
            onForgotPassword={() => console.log('Forgot password')}
          />
        );
      default:
        return <WelcomeScreen onRegister={() => navigateForward('Register')} onLogin={() => navigateForward('Login')} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
    </View>
  );
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
