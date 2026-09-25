import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

/** Shared full-screen background, identical to the customer mobile app. */
export function AppBackground({ children }: { children: ReactNode }) {
    return (
        <LinearGradient
            colors={['#FFF3C4', '#FFF9E6', '#FFFFFF']}
            locations={[0, 0.48, 1]}
            style={{ flex: 1 }}
        >
            {children}
        </LinearGradient>
    );
}
