import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Check } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';

export type ThemeMode = 'light' | 'dark' | 'system';

type DisplayModeCardProps = {
    label: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onPress: () => void;
};

export function DisplayModeCard({
    label,
    description,
    icon,
    selected,
    onPress,
}: DisplayModeCardProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const paddingX = isTinyScreen ? 'px-2.5' : isSmallScreen ? 'px-3' : 'px-4';
    const paddingY = isTinyScreen ? 'py-2.5' : isSmallScreen ? 'py-2.5' : 'py-3';
    const iconBox = 'h-12 w-12';
    const iconRadius = 'rounded-2xl';
    const labelSize = isTinyScreen ? 'text-[13px]' : isSmallScreen ? 'text-[14px]' : 'text-base';
    const descSize = isTinyScreen ? 'text-[11px]' : isSmallScreen ? 'text-[12px]' : 'text-sm';
    const gap = isTinyScreen ? 'ml-2' : 'ml-3';
    const checkSize = isTinyScreen ? 'h-6.5 w-6.5' : 'h-7 w-7';
    const checkIcon = isTinyScreen ? 14 : 15;
    const mb = isTinyScreen ? 'mb-3' : 'mb-4';

    return (
        <Pressable className={`${mb} active:opacity-90`} onPress={onPress}>
            <GlassCard variant="light" className="rounded-2xl">
                <View
                    className={`bg-white/60 flex-row items-center ${paddingX} ${paddingY} rounded-2xl border-[1.5px] ${selected ? 'border-slate-900' : 'border-transparent'} min-w-0`}
                >
                    <GradientPill className={`${iconBox} ${iconRadius} shrink-0`}>
                        <View className="h-full w-full items-center justify-center">{icon}</View>
                    </GradientPill>
                    <View className={`${gap} flex-1 min-w-0`}>
                        <Text
                            className={`${labelSize} font-lufga-bold text-slate-950`}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {label}
                        </Text>
                        <Text
                            className={`mt-0.5 ${descSize} font-lufga text-slate-500`}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {description}
                        </Text>
                    </View>
                    {selected && (
                        <View
                            className={`${checkSize} shrink-0 items-center justify-center rounded-full bg-slate-900`}
                        >
                            <Check size={checkIcon} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </GlassCard>
        </Pressable>
    );
}
