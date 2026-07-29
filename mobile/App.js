import './global.css';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { queryClient } from './lib/queryClient';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { HomePage } from './pages/HomePage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { useAuthStore } from './lib/authStore';

function AppContent() {
  const [screen, setScreen] = useState('Splash');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [direction, setDirection] = useState('forward');
  const { isAuthenticated, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (screen === 'Splash') {
      const timer = setTimeout(() => {
        setScreen('Welcome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const navigateForward = useCallback((target) => {
    setDirection('forward');
    setScreen(target);
  }, []);

  const navigateBack = useCallback((target) => {
    setDirection('back');
    setScreen(target);
  }, []);

  const entering = direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300);
  const exiting = direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300);

  // Splash — fades out
  if (screen === 'Splash') {
    return (
      <Animated.View exiting={FadeOut.duration(400)} style={{ flex: 1 }}>
        <SplashScreen />
      </Animated.View>
    );
  }

  // Authenticated screens
  if (isAuthenticated) {
    if (activeProduct) {
      return (
        <Animated.View key="product" entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(250)} style={{ flex: 1 }}>
          <ProductDetailPage
            name={activeProduct.name}
            store={activeProduct.store}
            price={activeProduct.price}
            image={activeProduct.image}
            onBack={() => setActiveProduct(null)}
          />
        </Animated.View>
      );
    }

    if (activeCategory) {
      return (
        <Animated.View key="category" entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(250)} style={{ flex: 1 }}>
          <CategoryDetailPage
            title={activeCategory.name}
            subtitle={activeCategory.subtitle}
            onBack={() => setActiveCategory(null)}
            onProductPress={(product) => setActiveProduct(product)}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View key="home" entering={FadeIn.duration(300)} style={{ flex: 1 }}>
        <HomePage
          onCategoryPress={(cat) => setActiveCategory(cat)}
          onProductPress={(product) => setActiveProduct(product)}
        />
      </Animated.View>
    );
  }

  // Auth screens
  const renderScreen = () => {
    switch (screen) {
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
            onRegister={() => navigateBack('Register')}
            onForgotPassword={() => console.log('Forgot password')}
          />
        );
      default:
        return <WelcomeScreen onRegister={() => navigateForward('Register')} />;
    }
  };

  return (
    <Animated.View key={screen} entering={entering} exiting={exiting} style={{ flex: 1 }}>
      {renderScreen()}
    </Animated.View>
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
