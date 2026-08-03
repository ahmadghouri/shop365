import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

type GlassCardProps = React.ComponentProps<typeof View> & {
    className?: string;
    intensity?: number;
};

/**
 * Reusable glass-morphism card component
 * - border-radius: 24px
 * - background: rgba(255, 255, 255, 0.50) (#FFFFFF80)
 * - backdrop-filter: blur(100px)
 */
export function GlassCard({ className, style, intensity = 100, children, ...props }: GlassCardProps) {
    const containerStyle: ViewStyle = {
        borderRadius: 12,
        overflow: 'hidden',
    };

    return (
        <View
            className={cn('overflow-hidden', className)}
            style={[containerStyle, style]}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint="light"
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.50)',
                }}
            >
                {children}
            </BlurView>
        </View>
    );
}
