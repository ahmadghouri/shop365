import { Text, View, useWindowDimensions } from 'react-native';

export const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    confirmed: { label: 'Confirmed', bg: 'bg-sky-100', text: 'text-sky-700' },
    preparing: { label: 'Preparing', bg: 'bg-blue-100', text: 'text-blue-700' },
    picked_up: { label: 'Picked up', bg: 'bg-purple-100', text: 'text-purple-700' },
    out_for_delivery: { label: 'Out for delivery', bg: 'bg-[#EAB308]', text: 'text-slate-900' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-600' },
};

export function OrderStatusBadge({ status }: { status: string }) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const badgePx = isTinyScreen ? 'px-2.5' : isSmallScreen ? 'px-3' : 'px-4';
    const badgePy = isTinyScreen ? 'py-1' : isSmallScreen ? 'py-1' : 'py-1.5';
    const textSize = isTinyScreen ? 'text-[10px]' : isSmallScreen ? 'text-[11px]' : 'text-sm';

    const s = STATUS_MAP[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <View className={`rounded-full ${badgePx} ${badgePy} ${s.bg}`}>
            <Text className={`${textSize} font-lufga-medium ${s.text}`} numberOfLines={1}>
                {s.label}
            </Text>
        </View>
    );
}
