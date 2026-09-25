import './global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppBackground } from '@/components/AppBackground';
import { AuthScreen } from '@/pages/AuthScreen';
import { RiderHomePage } from '@/pages/RiderHomePage';
import { useAuthStore } from '@/lib/authStore';

const queryClient = new QueryClient();

function Root() {
    const { token, loading, loadSession } = useAuthStore();

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    if (loading) {
        return (
            <AppBackground>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#EAB308" />
                </View>
            </AppBackground>
        );
    }

    return token ? <RiderHomePage /> : <AuthScreen />;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <StatusBar style="dark" />
                <Root />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
