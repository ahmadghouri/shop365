import { Pressable, Text, View } from 'react-native';
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
    return (
        <Pressable className="mb-4 active:opacity-90" onPress={onPress}>
            <GlassCard variant="light" className="rounded-2xl">
                <View
                    className={`bg-white/60 flex-row items-center px-4 py-3 rounded-2xl border-[1.5px] ${selected ? 'border-slate-900' : 'border-transparent'}`}
                >
                    <GradientPill className="h-12 w-12 rounded-2xl">
                        <View className="h-full w-full items-center justify-center">{icon}</View>
                    </GradientPill>
                    <View className="ml-3 flex-1">
                        <Text className="text-base font-lufga-bold text-slate-950">{label}</Text>
                        <Text className="mt-0.5 text-sm font-lufga text-slate-500">
                            {description}
                        </Text>
                    </View>
                    {selected && (
                        <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-900">
                            <Check size={15} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </GlassCard>
        </Pressable>
    );
}
