import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

type StatCardProps = {
    label: string;
    value: string | number;
    icon?: ReactNode;
};

/** Small metric card used across the dashboards. */
export function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <GlassCard className="flex-1">
            <View className="flex-row items-center gap-2">
                {icon}
                <Text className="text-xs text-slate-500">{label}</Text>
            </View>
            <Text className="mt-1 text-2xl font-bold text-slate-900">{value}</Text>
        </GlassCard>
    );
}
