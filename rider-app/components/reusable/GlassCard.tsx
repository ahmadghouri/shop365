import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

type GlassCardProps = ViewProps & {
    className?: string;
    /** "glass" = frosted (cart/rider style); "dark" = #1D1D1D surface. */
    variant?: 'glass' | 'dark' | 'plain';
    children?: ReactNode;
};

/**
 * Reusable card. The frosted "glass" background copies the customer app's
 * cart/rider cards: border border-white bg-white/50.
 */
export function GlassCard({ className, variant = 'glass', children, ...props }: GlassCardProps) {
    const base =
        variant === 'glass'
            ? 'rounded-2xl border border-white bg-white/50 p-4'
            : variant === 'dark'
              ? 'rounded-2xl bg-[#1D1D1D] p-4'
              : 'rounded-2xl bg-white p-4';
    return (
        <View className={cn(base, className)} {...props}>
            {children}
        </View>
    );
}
