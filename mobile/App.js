import './global.css';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PortalHost } from '@rn-primitives/portal';
import { queryClient } from './lib/queryClient';
import { Router } from './pages/Router';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <PortalHost />
                <Router />
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
