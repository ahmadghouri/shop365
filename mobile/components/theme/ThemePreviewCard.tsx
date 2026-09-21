import { Text, View } from 'react-native';
import { Palette } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import type { AccentColor } from './AccentColorPicker';

type ThemePreviewCardProps = {
    accent: AccentColor;
};

export function ThemePreviewCard({ accent }: ThemePreviewCardProps) {
    return (
        <GlassCard variant="light" className="rounded-3xl p-5">
            <View className="flex-row items-center mb-4">
                <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: accent.swatchLight }}
                >
                    <Palette size={23} color={accent.iconColor} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-base font-lufga-bold text-slate-950">
                        Button preview
                    </Text>
                    <Text className="mt-1 text-sm font-lufga text-slate-500">
                        {accent.name} theme
                    </Text>
                </View>
            </View>
            <GradientPill
                className="rounded-full h-12"
                colors={[accent.swatchLight, accent.swatch]}
            >
                <View className="flex-1 items-center justify-center">
                    <Text
                        className="text-sm font-lufga-semibold"
                        style={{ color: accent.iconColor }}
                    >
                        Primary action
                    </Text>
                </View>
            </GradientPill>
        </GlassCard>
    );
}
