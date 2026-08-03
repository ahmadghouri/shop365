import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

type AppBackgroundProps = {
    children: ReactNode;
};

/** Shared full-screen background used across the mobile app. */
export function AppBackground({ children }: AppBackgroundProps) {
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
