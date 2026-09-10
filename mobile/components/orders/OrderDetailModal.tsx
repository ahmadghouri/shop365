import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Package, X } from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';
import { API_BASE_URL } from '@/api/client';
import { OrderStatusBadge } from './OrderStatusBadge';

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return iso; }
}

type Props = { orderId: string; onClose: () => void };

export function OrderDetailModal({ orderId, onClose }: Props) {
    const { data: order, isLoading } = useOrderDetail(orderId);
    const shortId = orderId.slice(-6).toUpperCase();

    return (
        <Modal visible animationType="slide" transparent onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
                <Pressable className="rounded-t-[32px] bg-white px-5 pb-10 pt-4 max-h-[80%]" onPress={() => {}}>
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
                        <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-slate-100" onPress={onClose}>
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
                                <OrderStatusBadge status={order.status} />
                            </View>

                            {/* Items grouped by vendor */}
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

                            {/* Summary */}
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
