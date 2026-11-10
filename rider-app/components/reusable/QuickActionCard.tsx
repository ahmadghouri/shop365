import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

type QuickActionCardProps = {
    label: string;
    icon: ReactNode;
    onPress?: () => void;
};

/** Shortcut tile used in the Quick Actions grid. */
export function QuickActionCard({ label, icon, onPress }: QuickActionCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={{ width: '48%' }}
            className="mb-3 overflow-hidden rounded-3xl border-[1.5px] border-white p-4 active:opacity-80"
        >
            <BlurView
                intensity={100}
                tint="light"
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.50)' }]}
            />
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                {icon}
            </View>
            <Text className="mt-3 text-sm font-semibold text-slate-900">{label}</Text>
        </Pressable>
    );
}
