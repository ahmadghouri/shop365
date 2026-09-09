import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Package, X } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { GlassCard } from '@/components/reusable/GlassCard';
import { useOrders, useOrderDetail } from '@/api/orders/useOrderQueries';
import { API_BASE_URL } from '@/api/client';
import type { Order } from '@/api/orders/order.service';

type OrderHistoryPageProps = { onBack?: () => void };

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    processing: { label: 'Preparing', bg: 'bg-blue-100', text: 'text-blue-700' },
    shipped: { label: 'On the way', bg: 'bg-[#EAB308]', text: 'text-slate-900' },
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
                    {/* Handle */}
                    <View className="w-10 h-1 rounded-full bg-slate-200 self-center mb-4" />

                    {/* Header */}
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
                            {/* Status */}
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-sm font-lufga text-slate-500">Status</Text>
                                <StatusBadge status={order.status} />
                            </View>

                            {/* Items */}
                            <Text className="text-sm font-lufga-semibold text-slate-700 mb-2">Items</Text>
                            {(() => {
                                const groups: Record<string, typeof order.items> = {};
                                (order.items ?? []).forEach(item => {
                                    const vendor = (item.product_id as any)?.business_id?.name || 'Provider';
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

                            {/* Summary */}
                            <View className="mt-4 bg-slate-50 rounded-2xl p-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                    <Text className="text-sm font-lufga-medium text-slate-800">
                                        Rs {(order.total_amount - (order.delivery_charge ?? 0)).toLocaleString()}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm font-lufga text-slate-500">Delivery</Text>
                                    <Text className="text-sm font-lufga-medium text-slate-800">Rs {order.delivery_charge ?? 0}</Text>
                                </View>
                                <View className="flex-row justify-between pt-2 border-t border-slate-200">
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

// ── Order Card ────────────────────────────────────────────────────────────
function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
    const isActive = order.status === 'shipped' || order.status === 'processing';
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

                    {isActive ? (
                        <View className="flex-row" style={{ gap: 12 }}>
                            <GradientPill className="flex-1 rounded-full h-12">
                                <Pressable className="flex-1 items-center justify-center active:opacity-80">
                                    <Text className="text-sm font-lufga-semibold text-slate-900">Reorder</Text>
                                </Pressable>
                            </GradientPill>
                            <Pressable className="flex-1 h-12 rounded-full border border-[#EAB308] items-center justify-center active:opacity-70">
                                <Text className="text-sm font-lufga-semibold text-slate-800">Track</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <GradientPill className="rounded-full h-12">
                            <Pressable className="flex-1 items-center justify-center active:opacity-80">
                                <Text className="text-sm font-lufga-semibold text-slate-900">Reorder</Text>
                            </Pressable>
                        </GradientPill>
                    )}
                </View>
            </GlassCard>
        </Pressable>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────
export function OrderHistoryPage({ onBack }: OrderHistoryPageProps) {
    const { data: orders = [], isLoading, isError, refetch } = useOrders();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
                    <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onPress={() => setSelectedOrderId(order._id)}
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
        </AppBackground>
    );
}
