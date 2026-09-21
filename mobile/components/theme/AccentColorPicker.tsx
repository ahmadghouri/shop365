import { Pressable, Text, View } from 'react-native';
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
    return (
        <GlassCard variant="light" className="rounded-3xl p-5">
            <View className="flex-row flex-wrap gap-3 justify-between">
                {colors.map((color) => {
                    const selected = selectedId === color.id;
                    return (
                        <Pressable
                            key={color.id}
                            className="items-center active:opacity-80 w-[30%] mb-1"
                            onPress={() => onSelect(color.id)}
                        >
                            <View className="relative">
                                <View
                                    className={`h-16 w-16 items-center justify-center rounded-2xl border-[1.5px] ${selected ? 'border-slate-900' : 'border-transparent'}`}
                                    style={{ backgroundColor: color.swatchLight }}
                                >
                                    <View
                                        className="h-8 w-8 rounded-full"
                                        style={{ backgroundColor: color.swatch }}
                                    />
                                </View>
                                {selected && (
                                    <View className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-slate-900">
                                        <Text className="text-[10px] font-lufga-bold text-white">✓</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="mt-2 text-sm font-lufga-semibold text-slate-700">
                                {color.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </GlassCard>
    );
}
