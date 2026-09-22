import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { GlassCard } from '@/components/reusable/GlassCard';

export type AccentColor = {
    id: string;
    name: string;
    swatch: string;
    swatchLight: string;
    iconColor: string;
};

type AccentColorPickerProps = {
    colors: AccentColor[];
    selectedId: string;
    onSelect: (id: string) => void;
};

export function AccentColorPicker({ colors, selectedId, onSelect }: AccentColorPickerProps) {
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const cardPad = isTiny ? 12 : isSmall ? 14 : 20;
    const swatchBox = isTiny ? 52 : isSmall ? 58 : 64;
    const dotSize = isTiny ? 24 : isSmall ? 28 : 32;
    const labelSize = isTiny ? 10 : isSmall ? 11 : 14;
    const badgeSize = isTiny ? 16 : isSmall ? 18 : 20;

    return (
        <GlassCard variant="light" className="rounded-3xl">
            <View style={{ padding: cardPad, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {colors.map((color) => {
                    const selected = selectedId === color.id;
                    return (
                        <Pressable
                            key={color.id}
                            style={{ width: '30%', alignItems: 'center', marginBottom: isTiny ? 10 : 14 }}
                            className="active:opacity-80"
                            onPress={() => onSelect(color.id)}
                        >
                            <View style={{ position: 'relative' }}>
                                <View
                                    style={{
                                        height: swatchBox,
                                        width: swatchBox,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 16,
                                        backgroundColor: color.swatchLight,
                                        borderWidth: 1.5,
                                        borderColor: selected ? '#0f172a' : 'transparent',
                                    }}
                                >
                                    <View
                                        style={{
                                            height: dotSize,
                                            width: dotSize,
                                            borderRadius: dotSize / 2,
                                            backgroundColor: color.swatch,
                                        }}
                                    />
                                </View>
                                {selected && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -4,
                                            height: badgeSize,
                                            width: badgeSize,
                                            borderRadius: badgeSize / 2,
                                            backgroundColor: '#0f172a',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text style={{ fontSize: isTiny ? 8 : 10, color: '#fff', fontWeight: '700' }}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                style={{ fontSize: labelSize, marginTop: isTiny ? 5 : 8 }}
                                className="font-lufga-semibold text-slate-700"
                                numberOfLines={1}
                            >
                                {color.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </GlassCard>
    );
}
