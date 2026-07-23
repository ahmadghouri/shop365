import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { HomePage } from './pages/HomePage';
import { useAuthStore } from './lib/authStore';

function AppContent() {
  const [screen, setScreen] = useState('Welcome');
  const { isAuthenticated, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

  // If authenticated, show home
  if (isAuthenticated) {
    return <HomePage />;
  }

  switch (screen) {
    case 'Register':
      return (
        <RegisterScreen
          onSuccess={() => { }}
          onLogin={() => setScreen('Login')}
        />
      );
    case 'Login':
      return (
        <LoginScreen
          onSuccess={() => { }}
          onRegister={() => setScreen('Register')}
          onForgotPassword={() => console.log('Forgot password')}
        />
      );
    default:
      return <WelcomeScreen onRegister={() => setScreen('Register')} />;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
