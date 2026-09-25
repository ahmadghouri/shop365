import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

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
            className="mb-3 rounded-2xl border border-white bg-white/50 p-4 active:opacity-80"
        >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                {icon}
            </View>
            <Text className="mt-3 text-sm font-semibold text-slate-900">{label}</Text>
        </Pressable>
    );
}
