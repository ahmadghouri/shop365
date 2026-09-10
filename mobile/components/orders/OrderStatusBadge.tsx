import { Text, View } from 'react-native';

export const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    pending:          { label: 'Pending',         bg: 'bg-amber-100',   text: 'text-amber-700' },
    confirmed:        { label: 'Confirmed',        bg: 'bg-sky-100',     text: 'text-sky-700' },
    preparing:        { label: 'Preparing',        bg: 'bg-blue-100',    text: 'text-blue-700' },
    picked_up:        { label: 'Picked up',        bg: 'bg-purple-100',  text: 'text-purple-700' },
    out_for_delivery: { label: 'Out for delivery', bg: 'bg-[#EAB308]',   text: 'text-slate-900' },
    delivered:        { label: 'Delivered',        bg: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled:        { label: 'Cancelled',        bg: 'bg-red-100',     text: 'text-red-600' },
};

export function OrderStatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <View className={`rounded-full px-4 py-1.5 ${s.bg}`}>
            <Text className={`text-sm font-lufga-medium ${s.text}`}>{s.label}</Text>
        </View>
    );
}
