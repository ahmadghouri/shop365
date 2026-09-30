import { Switch, Text, View } from 'react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';

type SettingsToggleRowProps = {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value: boolean;
    disabled?: boolean;
    onValueChange: (v: boolean) => void;
};

/** A card row with an icon, title/subtitle, and a switch on the right. */
export function SettingsToggleRow({
    icon,
    title,
    subtitle,
    value,
    disabled,
    onValueChange,
}: SettingsToggleRowProps) {
    return (
        <GlassCard variant="light" className={`rounded-2xl mb-3 ${disabled ? 'opacity-50' : ''}`}>
            <View className="flex-row items-center px-4 py-5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-amber-50 mr-3">
                    {icon}
                </View>
                <View className="flex-1 min-w-0 mr-3">
                    <Text className="text-sm font-lufga-semibold text-slate-900">{title}</Text>
                    {subtitle ? (
                        <Text className="text-xs font-lufga text-slate-400 mt-0.5" numberOfLines={2}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    trackColor={{ false: '#e2e8f0', true: AppColors.yellow }}
                    thumbColor="#ffffff"
                />
            </View>
        </GlassCard>
    );
}
