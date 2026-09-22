import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '@/api/orders/order.service';

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

type Props = {
    order: Order;
    onPress: () => void;
    onTrack: () => void;
};

export function OrderCard({ order, onPress, onTrack }: Props) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const paddingP = isTinyScreen ? 'p-3' : isSmallScreen ? 'p-3.5' : 'p-4';
    const mbCard = isTinyScreen ? 'mb-3' : 'mb-4';
    const mbHeader = isTinyScreen ? 'mb-2' : 'mb-3';
    const mbItems = isTinyScreen ? 'mb-2' : 'mb-3';
    const mbVendors = isTinyScreen ? 'mb-2' : 'mb-3';
    const itemsPx = isTinyScreen ? 'px-3' : 'px-4';
    const itemsPy = isTinyScreen ? 'py-2.5' : 'py-3';
    const orderIdSize = isTinyScreen ? 'text-[14px]' : isSmallScreen ? 'text-[15px]' : 'text-base';
    const dateSize = isTinyScreen ? 'text-[10px]' : 'text-xs';
    const itemsTextSize = isTinyScreen ? 'text-xs' : 'text-sm';
    const actionsH = isTinyScreen ? 'h-10' : isSmallScreen ? 'h-11' : 'h-12';
    const actionTextSize = isTinyScreen ? 'text-xs' : 'text-sm';
    const vendorPx = isTinyScreen ? 'px-2.5' : 'px-3';
    const vendorPy = isTinyScreen ? 'py-0.5' : 'py-1';
    const vendorTextSize = isTinyScreen ? 'text-[10px]' : 'text-xs';
    const actionsGap = isTinyScreen ? 8 : 12;
    const vendorGap = isTinyScreen ? 4 : 6;

    const shortId = order._id.slice(-6).toUpperCase();

    return (
        <Pressable className={`${mbCard} active:opacity-90`} onPress={onPress}>
            <GlassCard variant="light" className="rounded-3xl">
                <View className={paddingP}>
                    {/* Header */}
                    <View className={`flex-row items-center justify-between ${mbHeader} min-w-0`}>
                        <View className="flex-1 min-w-0 mr-2">
                            <Text
                                className={`${orderIdSize} font-lufga-semibold text-slate-900`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Order #{shortId}
                            </Text>
                            <Text
                                className={`${dateSize} font-lufga text-slate-400 mt-0.5`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {formatDate(order.createdAt)}
                            </Text>
                        </View>
                        <View className="shrink-0">
                            <OrderStatusBadge status={order.status} />
                        </View>
                    </View>

                    {/* Items + total */}
                    <View
                        className={`flex-row justify-between bg-white/60 rounded-2xl ${itemsPx} ${itemsPy} ${mbItems} min-w-0`}
                    >
                        {(order.item_count ?? 0) > 0 && (
                            <Text
                                className={`${itemsTextSize} font-lufga text-slate-700 mr-2`}
                                numberOfLines={1}
                            >
                                Items:{' '}
                                <Text className="font-lufga-semibold">{order.item_count}</Text>
                            </Text>
                        )}
                        <Text
                            className={`${itemsTextSize} font-lufga text-slate-700`}
                            numberOfLines={1}
                        >
                            Total:{' '}
                            <Text className="font-lufga-semibold">
                                Rs {order.total_price?.toLocaleString()}
                            </Text>
                        </Text>
                    </View>

                    {/* Vendor pills */}
                    {order.vendors && order.vendors.length > 0 && (
                        <View
                            className={`flex-row flex-wrap ${mbVendors}`}
                            style={{ gap: vendorGap }}
                        >
                            {order.vendors.map((v) => (
                                <View
                                    key={v}
                                    className={`rounded-full bg-amber-50 ${vendorPx} ${vendorPy} shrink-0`}
                                >
                                    <Text
                                        className={`${vendorTextSize} font-lufga-semibold text-amber-700`}
                                        numberOfLines={1}
                                    >
                                        {v}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Actions */}
                    <View className="flex-row" style={{ gap: actionsGap }}>
                        <GradientPill className={`flex-1 rounded-full ${actionsH}`}>
                            <Pressable className="flex-1 items-center justify-center active:opacity-80">
                                <Text
                                    className={`${actionTextSize} font-lufga-semibold text-slate-900`}
                                >
                                    Reorder
                                </Text>
                            </Pressable>
                        </GradientPill>
                        <Pressable
                            className={`flex-1 ${actionsH} rounded-full border border-[#EAB308] items-center justify-center active:opacity-70`}
                            onPress={onTrack}
                        >
                            <Text
                                className={`${actionTextSize} font-lufga-semibold text-slate-800`}
                            >
                                Track
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </GlassCard>
        </Pressable>
    );
}
