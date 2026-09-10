import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';
import type { Order } from '@/api/orders/order.service';
import { STATUS_MAP } from './OrderStatusBadge';
import { OrderTimeline, PingDot, statusToStep, TRACK_STEPS } from './OrderTimeline';
import { OrderRiderCard } from './OrderRiderCard';

type Props = { order: Order; onClose: () => void };

export function OrderTrackingModal({ order, onClose }: Props) {
    const { data: detail } = useOrderDetail(order._id);
    const shortId   = order._id.slice(-6).toUpperCase();
    const cancelled = order.status === 'cancelled';
    const statusLabel = STATUS_MAP[order.status]?.label ?? order.status;
    const eta = order.status === 'delivered' ? 'Delivered' : cancelled ? 'Cancelled' : statusLabel;
    const partnerName = order.rider?.name || order.vendors?.[0] || 'Delivery partner';
    const riderPhone = order.rider?.phone_no;
    const riderImage = order.rider?.image;
    const showRider   = ['picked_up', 'out_for_delivery', 'delivered'].includes(order.status);

    // Build timestamp map from status_history
    const historyMap: Record<string, string> = {};
    (detail?.status_history ?? []).forEach((h: { status: string; at: string }) => {
        historyMap[h.status] = h.at;
    });

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
                <View className="flex-1 rounded-t-3xl bg-white px-5 pt-6" style={{ marginTop: -24 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                        {/* Status header */}
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs font-lufga-semibold text-slate-400">Arriving in</Text>
                                <Text className="mt-0.5 text-2xl font-lufga-bold text-slate-900">{eta}</Text>
                                <Text className="mt-0.5 text-xs font-lufga text-slate-400">Order #{shortId}</Text>
                            </View>
                            <View className={`rounded-full px-4 py-2 ${cancelled ? 'bg-red-50' : 'bg-[#EAB308]'}`}>
                                <Text className={`text-xs font-lufga-bold ${cancelled ? 'text-red-600' : 'text-slate-900'}`}>
                                    {statusLabel}
                                </Text>
                            </View>
                        </View>

                        {/* Rider card */}
                        {showRider && (
                            <OrderRiderCard
                                partnerName={partnerName}
                                phoneNumber={riderPhone}
                                image={riderImage}
                            />
                        )}

                        {/* Timeline */}
                        <OrderTimeline
                            status={order.status}
                            cancelled={cancelled}
                            historyMap={historyMap}
                            createdAt={order.createdAt}
                        />

                        {/* Order support */}
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
