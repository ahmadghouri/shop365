import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { GradientPill } from './GradientPill';

type ProfileSettingCardProps = {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
};

export function ProfileSettingCard({ icon, label, onPress }: ProfileSettingCardProps) {
    return (
        <Pressable className="mb-4 active:opacity-90" onPress={onPress}>
            <GlassCard variant="light" className="rounded-2xl">
                <View className="bg-white/60 flex-row items-center px-4 py-3 rounded-2xl">
                    <GradientPill className="h-10 w-10 rounded-2xl">
                        <View className="h-full w-full items-center justify-center">{icon}</View>
                    </GradientPill>
                    <Text className="ml-3 flex-1 font-lufga-semibold text-slate-950">{label}</Text>
                    <ChevronRight size={18} color="#cbd5e1" />
                </View>
            </GlassCard>
        </Pressable>
    );
}
