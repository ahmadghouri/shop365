import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
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
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const headerTitleSize = isTinyScreen ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-2xl';
    const headerPaddingX = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const contentPaddingX = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const backBtnSize = isTinyScreen ? 'h-9 w-9' : isSmallScreen ? 'h-10 w-10' : 'h-11 w-11';
    const backBtnRadius = isTinyScreen ? 'rounded-xl' : 'rounded-2xl';
    const backIconSize = isTinyScreen ? 20 : isSmallScreen ? 21 : 23;

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
                <View className={`flex-row items-center ${headerPaddingX} pt-2 pb-4 min-w-0`}>
                    <Pressable
                        className={`${backBtnSize} ${backBtnRadius} shrink-0 items-center justify-center bg-white/70 active:opacity-60 mr-3`}
                        onPress={onBack}
                    >
                        <ChevronLeft size={backIconSize} color="#1e293b" />
                    </Pressable>
                    <Text
                        className={`flex-1 ${headerTitleSize} font-lufga-bold text-slate-900`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        Order History
                    </Text>
                </View>

                {/* Content */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                ) : isError ? (
                    <View className={`flex-1 items-center justify-center ${contentPaddingX}`}>
                        <Text className="text-slate-500 font-lufga text-center mb-4">
                            Could not load orders.
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            className={`rounded-full bg-amber-50 ${isTinyScreen ? 'px-5 py-2.5' : 'px-6 py-3'}`}
                        >
                            <Text className="font-lufga-semibold text-amber-700">Retry</Text>
                        </Pressable>
                    </View>
                ) : orders.length === 0 ? (
                    <View className={`flex-1 items-center justify-center ${contentPaddingX}`}>
                        <Text className={`${isTinyScreen ? 'text-3xl' : 'text-4xl'} mb-4`}>🛍️</Text>
                        <Text
                            className={`${isTinyScreen ? 'text-base' : 'text-lg'} font-lufga-semibold text-slate-700`}
                        >
                            No orders yet
                        </Text>
                        <Text
                            className={`${isTinyScreen ? 'text-xs' : 'text-sm'} font-lufga text-slate-400 text-center mt-1`}
                        >
                            Your order history will appear here.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        className={`flex-1 ${contentPaddingX}`}
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
                                onTrack={() =>
                                    onTrackOrder ? onTrackOrder(order) : setTrackingOrder(order)
                                }
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
                <OrderTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
            )}
        </AppBackground>
    );
}
