import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

type Order = {
    id: string;
    createdAt?: string;
    total_price?: number;
    status?: string;
    items?: any[];
    _id?: string;
    date?: string;
    price?: number;
};

type OrderHistoryPageProps = {
    onBack?: () => void;
};

function StatusBadge({ status }: { status?: string }) {
    let label = 'Pending';
    let bg = 'bg-amber-100';
    let text = 'text-amber-900';

    if (!status || status === 'pending') {
        label = 'Pending';
        bg = 'bg-amber-100';
        text = 'text-amber-900';
    } else if (status === 'preparing') {
        label = 'Preparing';
        bg = 'bg-sky-100';
        text = 'text-sky-700';
    } else if (status === 'delivered') {
        label = 'Delivered';
        bg = 'bg-emerald-100';
        text = 'text-emerald-700';
    } else if (status === 'cancelled') {
        label = 'Cancelled';
        bg = 'bg-red-100';
        text = 'text-red-700';
    }

    return (
        <View className={`rounded-full px-4 py-1.5 ${bg}`}>
            <Text className={`text-sm font-lufga-medium ${text}`}>{label}</Text>
        </View>
    );
}

function OrderCard({ order }: { order: Order }) {
    const isOnTheWay = order.status === 'preparing';

    return (
        <View className="mb-4 rounded-3xl bg-white/80 p-4">
            {/* Header row */}
            <View className="flex-row items-center justify-between mb-3">
                <View>
                    <Text className="text-base font-lufga-semibold text-slate-900">Order ID: {String(order._id || order.id).slice(0,6)}</Text>
                    <Text className="text-xs font-lufga text-slate-400 mt-0.5">{order.date}</Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            {/* Items + Price */}
            <View className="flex-row justify-between bg-slate-50 rounded-2xl px-4 py-3 mb-3">
                <Text className="text-sm font-lufga text-slate-700">Items:  <Text className="font-lufga-semibold">{Array.isArray(order.items) ? order.items.length : (order.items ? String(order.items) : '0')}</Text></Text>
                <Text className="text-sm font-lufga text-slate-700">Price:  <Text className="font-lufga-semibold">{Number(order.price || 0).toLocaleString()}</Text></Text>
            </View>

            {/* Buttons */}
            {isOnTheWay ? (
                <View className="flex-row gap-3">
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
    );
}

export function OrderHistoryPage({ onBack }: OrderHistoryPageProps) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: () => api.get('/order').then((r) => r.data.data),
        staleTime: 30_000,
    });

    const orders: Order[] = data || [];

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

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {isLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color="#EAB308" />
                        </View>
                    ) : isError ? (
                        <View className="items-center px-5 py-12">
                            <Text className="font-lufga text-center text-red-600" onPress={() => refetch()}>
                                Failed to load orders. Tap to retry.
                            </Text>
                        </View>
                    ) : orders.length === 0 ? (
                        <View className="items-center px-5 py-12">
                            <Text className="font-lufga text-center text-slate-500">No orders yet.</Text>
                        </View>
                    ) : (
                        orders.map((order) => (
                            <OrderCard key={String(order._id || order.id)} order={{
                                _id: order._id,
                                date: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
                                items: Array.isArray(order.items) ? order.items : [],
                                price: order.total_price || order.price || 0,
                                status: order.status || 'pending',
                            } as any} />
                        ))
                    )}
                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
