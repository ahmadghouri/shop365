import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

type GlassVariant = 'default' | 'light';

type GlassCardProps = React.ComponentProps<typeof View> & {
    className?: string;
    intensity?: number;
    variant?: GlassVariant;
};

/**
 * Reusable glass-morphism card component
 *
 * Variants:
 *  - default → background: rgba(255,255,255, 0.50)
 *  - light   → background: rgba(255,255,255, 0.35)
 *
 * Border radius is controlled via className (e.g. rounded-3xl, rounded-full)
 */

const variantStyles: Record<GlassVariant, { backgroundColor: string }> = {
    'default': { backgroundColor: 'rgba(255, 255, 255, 0.50)' },
    'light': { backgroundColor: 'rgba(255, 255, 255, 0.35)' },
};

export function GlassCard({
    className,
    style,
    intensity = 100,
    variant = 'default',
    children,
    ...props
}: GlassCardProps) {
    const { backgroundColor } = variantStyles[variant];

    const containerStyle: ViewStyle = {
        overflow: 'hidden',
    };

    return (
        <View
            className={cn('overflow-hidden border-[1.5px] border-white', className)}
            style={[containerStyle, style]}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint="light"
                style={{ flex: 1, backgroundColor }}
            >
                {children}
            </BlurView>
        </View>
    );
}
