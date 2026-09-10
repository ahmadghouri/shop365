import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { useOrders } from '@/api/orders/useOrderQueries';
import type { Order } from '@/api/orders/order.service';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import { OrderTrackingModal } from '@/components/orders/OrderTrackingModal';

type OrderHistoryPageProps = {
    onBack?: () => void;
    onTrackOrder?: (order: Order) => void;
};

export function OrderHistoryPage({ onBack, onTrackOrder }: OrderHistoryPageProps) {
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
                {/* Header */}
                <View className="flex-row items-center px-5 pt-2 pb-4">
                    <Pressable
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60 mr-3"
                        onPress={onBack}
                    >
                        <ChevronLeft size={22} color="#1e293b" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-900">Order History</Text>
                </View>

                {/* Content */}
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
                    <ScrollView
                        className="flex-1 px-5"
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        {orders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onPress={() => setSelectedOrderId(order._id)}
                                onTrack={() => (onTrackOrder ? onTrackOrder(order) : setTrackingOrder(order))}
                            />
                        ))}
                        <View className="h-28" />
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Detail modal */}
            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {/* Tracking modal */}
            {trackingOrder && (
                <OrderTrackingModal
                    order={trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                />
            )}
        </AppBackground>
    );
}
