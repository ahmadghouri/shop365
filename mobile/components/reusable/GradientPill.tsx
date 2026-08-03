import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';

type GradientPillProps = React.ComponentProps<typeof View> & {
    className?: string;
    colors?: [string, string];
};

/**
 * Reusable gradient pill/button component
 * - border-radius: 100px
 * - background: linear-gradient(180deg, #FCD34D 0%, #EAB308 100%)
 */
export function GradientPill({ className, style, colors = ['#FCD34D', '#EAB308'], children, ...props }: GradientPillProps) {
    const containerStyle: ViewStyle = {
        borderRadius: 100,
        overflow: 'hidden',
    };

    return (
        <View
            className={cn('overflow-hidden', className)}
            style={[containerStyle, style]}
            {...props}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
            >
                {children}
            </LinearGradient>
        </View>
    );
}
