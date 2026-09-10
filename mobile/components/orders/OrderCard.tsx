import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '@/api/orders/order.service';

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return iso; }
}

type Props = {
    order: Order;
    onPress: () => void;
    onTrack: () => void;
};

export function OrderCard({ order, onPress, onTrack }: Props) {
    const shortId = order._id.slice(-6).toUpperCase();

    return (
        <Pressable className="mb-4 active:opacity-90" onPress={onPress}>
            <GlassCard variant="light" className="rounded-3xl">
                <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-base font-lufga-semibold text-slate-900">Order #{shortId}</Text>
                            <Text className="text-xs font-lufga text-slate-400 mt-0.5">{formatDate(order.createdAt)}</Text>
                        </View>
                        <OrderStatusBadge status={order.status} />
                    </View>

                    {/* Items + total */}
                    <View className="flex-row justify-between bg-white/60 rounded-2xl px-4 py-3 mb-3">
                        {(order.item_count ?? 0) > 0 && (
                            <Text className="text-sm font-lufga text-slate-700">
                                Items: <Text className="font-lufga-semibold">{order.item_count}</Text>
                            </Text>
                        )}
                        <Text className="text-sm font-lufga text-slate-700">
                            Total: <Text className="font-lufga-semibold">Rs {order.total_price?.toLocaleString()}</Text>
                        </Text>
                    </View>

                    {/* Vendor pills */}
                    {order.vendors && order.vendors.length > 0 && (
                        <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
                            {order.vendors.map(v => (
                                <View key={v} className="rounded-full bg-amber-50 px-3 py-1">
                                    <Text className="text-xs font-lufga-semibold text-amber-700">{v}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Actions */}
                    <View className="flex-row" style={{ gap: 12 }}>
                        <GradientPill className="flex-1 rounded-full h-12">
                            <Pressable className="flex-1 items-center justify-center active:opacity-80">
                                <Text className="text-sm font-lufga-semibold text-slate-900">Reorder</Text>
                            </Pressable>
                        </GradientPill>
                        <Pressable
                            className="flex-1 h-12 rounded-full border border-[#EAB308] items-center justify-center active:opacity-70"
                            onPress={onTrack}
                        >
                            <Text className="text-sm font-lufga-semibold text-slate-800">Track</Text>
                        </Pressable>
                    </View>
                </View>
            </GlassCard>
        </Pressable>
    );
}
