import { Text, useWindowDimensions, View } from 'react-native';
import { Palette } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import type { AccentColor } from './AccentColorPicker';

type ThemePreviewCardProps = {
    accent: AccentColor;
};

export function ThemePreviewCard({ accent }: ThemePreviewCardProps) {
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const cardPad = isTiny ? 12 : isSmall ? 14 : 20;
    const iconBoxSize = isTiny ? 42 : isSmall ? 46 : 48;
    const iconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const titleSize = isTiny ? 13 : isSmall ? 14 : 16;
    const subSize = isTiny ? 11 : isSmall ? 12 : 14;
    const btnHeight = isTiny ? 44 : isSmall ? 46 : 48;
    const btnFontSize = isTiny ? 12 : isSmall ? 13 : 14;

    return (
        <GlassCard variant="light" className="rounded-3xl">
            <View style={{ padding: cardPad }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isTiny ? 12 : 16 }}>
                    <View
                        style={{
                            height: iconBoxSize,
                            width: iconBoxSize,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 16,
                            backgroundColor: accent.swatchLight,
                        }}
                    >
                        <Palette size={iconSize} color={accent.iconColor} />
                    </View>
                    <View style={{ marginLeft: isTiny ? 10 : 12, flex: 1 }}>
                        <Text style={{ fontSize: titleSize }} className="font-lufga-bold text-slate-950">
                            Button preview
                        </Text>
                        <Text style={{ fontSize: subSize, marginTop: 3 }} className="font-lufga text-slate-500">
                            {accent.name} theme
                        </Text>
                    </View>
                </View>
                <GradientPill
                    style={{ height: btnHeight }}
                    className="rounded-full"
                    colors={[accent.swatchLight, accent.swatch]}
                >
                    <View className="flex-1 items-center justify-center">
                        <Text style={{ fontSize: btnFontSize, color: accent.iconColor }} className="font-lufga-semibold">
                            Primary action
                        </Text>
                    </View>
                </GradientPill>
            </View>
        </GlassCard>
    );
}
