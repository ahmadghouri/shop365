import { Text, View } from 'react-native';
import { Bike, Clock, ShoppingBag } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';

type ProviderInfoCardProps = {
    deliveryFee?: number;
    minimumOrder?: number;
    openingTime?: string;
    closingTime?: string;
};

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View className="flex-1 items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50 mb-1.5">
                {icon}
            </View>
            <Text className="text-sm font-lufga-semibold text-slate-900" numberOfLines={1}>
                {value}
            </Text>
            <Text className="text-[11px] font-lufga text-slate-400 mt-0.5">{label}</Text>
        </View>
    );
}

export function ProviderInfoCard({
    deliveryFee,
    minimumOrder,
    openingTime,
    closingTime,
}: ProviderInfoCardProps) {
    const hours =
        openingTime && closingTime ? `${openingTime} - ${closingTime}` : 'All day';

    return (
        <GlassCard variant="light" className="mx-5 mt-3 rounded-3xl">
            <View className="flex-row items-center px-3 py-4">
                <InfoItem
                    icon={<Bike size={17} color={AppColors.dark} />}
                    label="Delivery"
                    value={deliveryFee ? `Rs ${deliveryFee}` : 'Free'}
                />
                <View className="w-px h-10 bg-slate-200/70" />
                <InfoItem
                    icon={<ShoppingBag size={17} color={AppColors.dark} />}
                    label="Min. order"
                    value={minimumOrder ? `Rs ${minimumOrder}` : 'None'}
                />
                <View className="w-px h-10 bg-slate-200/70" />
                <InfoItem
                    icon={<Clock size={17} color={AppColors.dark} />}
                    label="Timing"
                    value={hours}
                />
            </View>
        </GlassCard>
    );
}
