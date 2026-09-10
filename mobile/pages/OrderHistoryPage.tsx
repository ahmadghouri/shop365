import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Linking, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronLeft, MessageCircle, Package, Phone, X } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { GlassCard } from '@/components/reusable/GlassCard';
import { useOrders, useOrderDetail } from '@/api/orders/useOrderQueries';
import { API_BASE_URL } from '@/api/client';
import type { Order } from '@/api/orders/order.service';

type OrderHistoryPageProps = { onBack?: () => void };

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    confirmed: { label: 'Confirmed', bg: 'bg-sky-100', text: 'text-sky-700' },
    preparing: { label: 'Preparing', bg: 'bg-blue-100', text: 'text-blue-700' },
    picked_up: { label: 'Picked up', bg: 'bg-purple-100', text: 'text-purple-700' },
    out_for_delivery: { label: 'Out for delivery', bg: 'bg-[#EAB308]', text: 'text-slate-900' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-600' },
};

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600' };
    return (
        <View className={`rounded-full px-4 py-1.5 ${s.bg}`}>
            <Text className={`text-sm font-lufga-medium ${s.text}`}>{s.label}</Text>
        </View>
    );
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return iso; }
}

// ── Order Detail Modal ────────────────────────────────────────────────────
function OrderDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
    const { data: order, isLoading } = useOrderDetail(orderId);
    const shortId = orderId.slice(-6).toUpperCase();

    return (
        <Modal visible animationType="slide" transparent onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
                <Pressable className="rounded-t-[32px] bg-white px-5 pb-10 pt-4 max-h-[80%]" onPress={() => { }}>
                    <View className="w-10 h-1 rounded-full bg-slate-200 self-center mb-4" />

                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-xl font-lufga-bold text-slate-900">Order #{shortId}</Text>
                            {order && (
                                <Text className="text-xs font-lufga text-slate-400 mt-0.5">{formatDate(order.createdAt)}</Text>
                            )}
                        </View>
                        <Pressable
                            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                            onPress={onClose}
                        >
                            <X size={18} color="#334155" />
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color="#EAB308" size="large" style={{ marginVertical: 40 }} />
                    ) : order ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-sm font-lufga text-slate-500">Status</Text>
                                <StatusBadge status={order.status} />
                            </View>

                            <Text className="text-sm font-lufga-semibold text-slate-700 mb-2">Items</Text>
                            {(() => {
                                const groups: Record<string, typeof order.items> = {};
                                (order.items ?? []).forEach(item => {
                                    const vendor = item.product_id?.business_id?.name || 'Provider';
                                    if (!groups[vendor]) groups[vendor] = [];
                                    groups[vendor].push(item);
                                });
                                return Object.entries(groups).map(([vendor, items]) => (
                                    <View key={vendor} className="mb-2">
                                        <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mb-1 mt-2">
                                            {vendor}
                                        </Text>
                                        {items.map((item, i) => {
                                            const imgUrl = item.product_id?.image_url
                                                ? (/^https?:\/\//.test(item.product_id.image_url)
                                                    ? item.product_id.image_url
                                                    : `${API_BASE_URL}/uploads/${item.product_id.image_url}`)
                                                : null;
                                            return (
                                                <View key={item._id ?? i} className="flex-row items-center justify-between py-3 border-b border-slate-100">
                                                    <View className="flex-row items-center flex-1">
                                                        <View className="h-12 w-12 rounded-xl bg-amber-50 items-center justify-center mr-3 overflow-hidden">
                                                            {imgUrl
                                                                ? <Image source={{ uri: imgUrl }} style={{ width: 48, height: 48 }} resizeMode="contain" />
                                                                : <Package size={18} color="#b77900" />
                                                            }
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="text-sm font-lufga-semibold text-slate-900" numberOfLines={1}>
                                                                {item.product_id?.title || 'Product'}
                                                            </Text>
                                                            <Text className="text-xs font-lufga text-slate-400">
                                                                Rs {item.price?.toLocaleString()} × {item.quantity}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-sm font-lufga-semibold text-slate-900 ml-2">
                                                        Rs {((item.price ?? 0) * item.quantity).toLocaleString()}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ));
                            })()}

                            <View className="mt-4 bg-slate-50 rounded-2xl p-4">
                                {(order.delivery_charge ?? 0) > 0 && (
                                    <>
                                        <View className="flex-row justify-between py-1 border-b border-slate-100">
                                            <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                            <Text className="text-sm font-lufga text-slate-700">
                                                Rs {((order.total_amount ?? 0) - (order.delivery_charge ?? 0)).toLocaleString()}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between py-1 border-b border-slate-100">
                                            <Text className="text-sm font-lufga text-slate-500">Delivery</Text>
                                            <Text className="text-sm font-lufga text-slate-700">
                                                Rs {(order.delivery_charge ?? 0).toLocaleString()}
                                            </Text>
                                        </View>
                                    </>
                                )}
                                <View className="flex-row justify-between pt-2">
                                    <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                                    <Text className="text-base font-lufga-bold text-slate-900">
                                        Rs {order.total_amount?.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ── Order Tracking Modal (SPO365-style live tracker) ──────────────────────
const TRACK_STEPS = ['Order placed', 'Order confirmed', 'Preparing your order', 'Picked up by rider', 'Out for delivery', 'Delivered'];

function statusToStep(status: string): number {
    switch (status) {
        case 'pending': return 0;
        case 'confirmed': return 1;
        case 'preparing': case 'processing': return 2;
        case 'picked_up': case 'shipped': return 3;
        case 'out_for_delivery': return 4;
        case 'delivered': return TRACK_STEPS.length;
        case 'cancelled': return -1;
        default: return 0;
    }
}

function PingDot() {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, { toValue: 2.6, duration: 1500, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);
    return (
        <Animated.View
            pointerEvents="none"
            className="absolute h-16 w-16 rounded-full bg-[#EAB308]"
            style={{ opacity, transform: [{ scale }] }}
        />
    );
}

function OrderTrackingModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const { data: detail } = useOrderDetail(order._id);
    const shortId = order._id.slice(-6).toUpperCase();
    const current = statusToStep(order.status);
    const cancelled = order.status === 'cancelled';
    const statusLabel = STATUS_MAP[order.status]?.label ?? order.status;
    const eta = order.status === 'delivered' ? 'Delivered' : cancelled ? 'Cancelled' : statusLabel;
    const partnerName = order.vendors?.[0] || 'Delivery partner';

    // Build time map from status_history
    const historyMap: Record<string, string> = {};
    (detail?.status_history ?? []).forEach((h: { status: string; at: string }) => {
        historyMap[h.status] = h.at;
    });
    console.log('[Tracking] detail loaded:', !!detail, 'history count:', detail?.status_history?.length, 'map:', historyMap);

    const STEP_STATUS_KEYS = ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];

    const getStepTime = (i: number): string => {
        const key = STEP_STATUS_KEYS[i];
        const at = historyMap[key] || (i === 0 ? order.createdAt : '');
        if (!at) return '';
        try {
            return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    return (
        <Modal visible animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-white">
                {/* Map area */}
                <View className="h-64 items-center justify-center bg-[#E8EEE9]">
                    <View className="absolute left-[42%] top-[40%]">
                        <View className="h-4 w-4 rounded-full bg-[#EAB308]" />
                        <PingDot />
                    </View>
                    <View className="absolute left-[68%] top-[66%] h-4 w-4 rounded-full border-[3px] border-white bg-[#141414] shadow-lg" />
                    <Pressable
                        className="absolute left-4 top-14 h-11 w-11 items-center justify-center rounded-2xl bg-white/95 active:opacity-70"
                        style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
                        onPress={onClose}
                    >
                        <ChevronLeft size={20} color="#141414" />
                    </Pressable>
                </View>

                {/* Bottom sheet */}
                <View className="relative flex-1 rounded-t-3xl bg-white px-5 pt-6" style={{ marginTop: -24 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs font-lufga-semibold text-slate-400">Arriving in</Text>
                                <Text className="mt-0.5 text-2xl font-lufga-bold text-slate-900">{eta}</Text>
                                <Text className="mt-0.5 text-xs font-lufga text-slate-400">Order #{shortId}</Text>
                            </View>
                            {cancelled ? (
                                <View className="rounded-full bg-red-50 px-4 py-2">
                                    <Text className="text-xs font-lufga-bold text-red-600">{statusLabel}</Text>
                                </View>
                            ) : (
                                <View className="rounded-full bg-[#EAB308] px-4 py-2">
                                    <Text className="text-xs font-lufga-bold text-slate-900">{statusLabel}</Text>
                                </View>
                            )}
                        </View>

                        {/* Rider */}
                        {/* Rider — only show when picked up or beyond */}
                        {['picked_up', 'out_for_delivery', 'delivered'].includes(order.status) && (
                            <View className="mt-5 flex-row items-center rounded-3xl bg-[#F7F7F5] p-4">
                                <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-200 overflow-hidden">
                                    <Text className="text-xs font-lufga text-slate-500">Rider</Text>
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-lufga-bold text-slate-900">{partnerName}</Text>
                                    <Text className="text-xs font-lufga text-slate-400">Your rider · ★ 4.9</Text>
                                </View>
                                <Pressable
                                    className="h-11 w-11 items-center justify-center rounded-full bg-[#141414] active:opacity-70"
                                    onPress={() => Linking.openURL('tel:+923000000000')}
                                >
                                    <Phone size={18} color="#EAB308" />
                                </Pressable>
                                <Pressable className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-[#EAB308] active:opacity-70">
                                    <MessageCircle size={18} color="#141414" />
                                </Pressable>
                            </View>
                        )}

                        {/* Timeline */}
                        <View className="mt-6 pb-4">
                            {TRACK_STEPS.map((title, i) => {
                                const done = current >= TRACK_STEPS.length ? true : i < current;
                                const active = !cancelled && i === current && current < TRACK_STEPS.length;
                                const isLast = i === TRACK_STEPS.length - 1;
                                const lineColor = done ? '#1e1e2e' : '#E5E5E5';
                                return (
                                    <View key={title} className="flex-row gap-3.5">
                                        <View className="items-center">
                                            <View className={`h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-slate-900' : active ? 'bg-[#EAB308]' : 'bg-[#E5E5E5]'}`}>
                                                {done ? (
                                                    <Check size={16} color="#EAB308" strokeWidth={3} />
                                                ) : active ? (
                                                    <View className="h-3 w-3 rounded-full bg-[#141414]" />
                                                ) : null}
                                            </View>
                                            {!isLast && <View className="h-9 w-0.5" style={{ backgroundColor: lineColor }} />}
                                        </View>
                                        <View className="pb-5">
                                            <Text className={`text-sm font-lufga-bold ${active ? 'text-[#141414]' : done ? 'text-[#141414]' : 'text-slate-400'}`}>
                                                {title}
                                            </Text>
                                            {(done || active) && getStepTime(i) ? (
                                                <Text className="text-xs font-lufga text-slate-400">{getStepTime(i)}</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        <Pressable
                            className="mb-8 h-12 items-center justify-center rounded-2xl border-[1.5px] border-[#EDEDF0] active:opacity-70"
                            onPress={onClose}
                        >
                            <Text className="text-sm font-lufga-bold text-slate-900">Order support</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ── Order Card ────────────────────────────────────────────────────────────
function OrderCard({ order, onPress, onTrack }: { order: Order; onPress: () => void; onTrack: () => void }) {
    const shortId = order._id.slice(-6).toUpperCase();

    return (
        <Pressable className="mb-4 active:opacity-90" onPress={onPress}>
            <GlassCard variant="light" className="rounded-3xl">
                <View className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-base font-lufga-semibold text-slate-900">Order #{shortId}</Text>
                            <Text className="text-xs font-lufga text-slate-400 mt-0.5">{formatDate(order.createdAt)}</Text>
                        </View>
                        <StatusBadge status={order.status} />
                    </View>

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

                    {order.vendors && order.vendors.length > 0 && (
                        <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
                            {order.vendors.map(v => (
                                <View key={v} className="rounded-full bg-amber-50 px-3 py-1">
                                    <Text className="text-xs font-lufga-semibold text-amber-700">{v}</Text>
                                </View>
                            ))}
                        </View>
                    )}

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

// ── Page ──────────────────────────────────────────────────────────────────
export function OrderHistoryPage({ onBack }: OrderHistoryPageProps) {
    const { data: orders = [], isLoading, isError, refetch } = useOrders();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center px-5 pt-2 pb-4">
                    <Pressable
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60 mr-3"
                        onPress={onBack}
                    >
                        <ChevronLeft size={22} color="#1e293b" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-900">Order History</Text>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                ) : isError ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <Text className="text-slate-500 font-lufga text-center mb-4">Could not load orders.</Text>
                        <Pressable onPress={() => refetch()} className="rounded-full bg-amber-50 px-6 py-3">
                            <Text className="font-lufga-semibold text-amber-700">Retry</Text>
                        </Pressable>
                    </View>
                ) : orders.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <Text className="text-4xl mb-4">🛍️</Text>
                        <Text className="text-lg font-lufga-semibold text-slate-700">No orders yet</Text>
                        <Text className="text-sm font-lufga text-slate-400 text-center mt-1">
                            Your order history will appear here.
                        </Text>
                    </View>
                ) : (
                    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#EAB308" colors={['#EAB308']} />}
                    >
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onPress={() => setSelectedOrderId(order._id)}
                                onTrack={() => setTrackingOrder(order)}
                            />
                        ))}
                        <View className="h-28" />
                    </ScrollView>
                )}
            </SafeAreaView>

            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {trackingOrder && (
                <OrderTrackingModal
                    order={trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                />
            )}
        </AppBackground>
    );
}