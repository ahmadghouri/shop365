import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

type GlassVariant = 'default' | 'light' | 'plain';

type GlassCardProps = ViewProps & {
    className?: string;
    /**
     * default → frosted rgba(255,255,255,0.50) (same as the customer app)
     * light   → frosted rgba(255,255,255,0.35)
     * plain   → solid white, no blur
     */
    variant?: GlassVariant;
    intensity?: number;
    children?: ReactNode;
};

const BACKGROUND: Record<Exclude<GlassVariant, 'plain'>, string> = {
    default: 'rgba(255, 255, 255, 0.50)',
    light: 'rgba(255, 255, 255, 0.35)',
};

/**
 * Glass-morphism card copied from the customer app: real blur, white 1.5px
 * border. Layout classes (padding, alignment) apply to the content.
 */
export function GlassCard({
    className,
    variant = 'default',
    intensity = 100,
    style,
    children,
    ...props
}: GlassCardProps) {
    if (variant === 'plain') {
        return (
            <View
                className={cn('overflow-hidden rounded-3xl border-[1.5px] border-white bg-white p-4', className)}
                style={style}
                {...props}
            >
                {children}
            </View>
        );
    }

    return (
        <View
            className={cn('overflow-hidden rounded-3xl border-[1.5px] border-white p-4', className)}
            style={style}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint="light"
                style={[StyleSheet.absoluteFill, { backgroundColor: BACKGROUND[variant] }]}
            />
            {children}
        </View>
    );
}
