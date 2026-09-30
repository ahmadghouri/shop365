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

// Turn a "HH:mm" or "HH:mm:ss" (24h) string into a friendly 12h label, e.g.
// "10:00:00" -> "10:00 AM", "23:00" -> "11:00 PM".
function formatTime(raw?: string): string | null {
    if (!raw) return null;
    const parts = String(raw).split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? 0);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

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
        <View className="flex-1 items-center px-1">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50 mb-1.5">
                {icon}
            </View>
            <Text
                className="text-[13px] font-lufga-semibold text-slate-900 text-center"
                numberOfLines={2}
            >
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
    const open = formatTime(openingTime);
    const close = formatTime(closingTime);
    const hours = open && close ? `${open} - ${close}` : 'All day';

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
