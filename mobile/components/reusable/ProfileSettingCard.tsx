import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { GradientPill } from './GradientPill';

type ProfileSettingCardProps = {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
};

export function ProfileSettingCard({ icon, label, onPress }: ProfileSettingCardProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const paddingX = isTinyScreen ? 'px-2.5' : isSmallScreen ? 'px-3' : 'px-4';
    const paddingY = isTinyScreen ? 'py-2.5' : isSmallScreen ? 'py-2.5' : 'py-3';
    const iconBox = 'h-10 w-10';
    const iconRadius = 'rounded-2xl';
    const labelSize = isTinyScreen ? 'text-[13px]' : isSmallScreen ? 'text-[14px]' : 'text-[15px]';
    const chevronSize = isTinyScreen ? 16 : isSmallScreen ? 17 : 18;
    const gap = isTinyScreen ? 'ml-2' : 'ml-3';
    const mb = isTinyScreen ? 'mb-3' : 'mb-4';

    return (
        <Pressable className={`${mb} active:opacity-90`} onPress={onPress}>
            <GlassCard variant="light" className="rounded-2xl">
                <View
                    className={`bg-white/60 flex-row items-center ${paddingX} ${paddingY} rounded-2xl min-w-0`}
                >
                    <GradientPill className={`${iconBox} ${iconRadius} shrink-0`}>
                        <View className="h-full w-full items-center justify-center">{icon}</View>
                    </GradientPill>
                    <Text
                        className={`${gap} flex-1 ${labelSize} font-lufga-semibold text-slate-950`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {label}
                    </Text>
                    <View className="shrink-0">
                        <ChevronRight size={chevronSize} color="#cbd5e1" />
                    </View>
                </View>
            </GlassCard>
        </Pressable>
    );
}
