import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';

// ponytail: mock data — replace with useQuery('/orders') when backend endpoint is ready
const MOCK_ORDERS = [
    { id: '3210990', date: 'Today at 2:00 PM', items: 32, price: 10050, status: 'on_the_way' },
    { id: '3210990', date: '24/07/2026 at 2:00 PM', items: 32, price: 10050, status: 'delivered' },
    { id: '3210990', date: '24/07/2026 at 2:00 PM', items: 32, price: 10050, status: 'delivered' },
    { id: '3210990', date: '24/07/2026 at 2:00 PM', items: 32, price: 10050, status: 'delivered' },
];

type Order = typeof MOCK_ORDERS[number];

type OrderHistoryPageProps = {
    onBack?: () => void;
};

function StatusBadge({ status }: { status: string }) {
    const isOnTheWay = status === 'on_the_way';
    return (
        <View className={`rounded-full px-4 py-1.5 ${isOnTheWay ? 'bg-[#EAB308]' : 'bg-emerald-100'}`}>
            <Text className={`text-sm font-lufga-medium ${isOnTheWay ? 'text-slate-900' : 'text-emerald-700'}`}>
                {isOnTheWay ? 'On the way' : 'Delivered'}
            </Text>
        </View>
    );
}

function OrderCard({ order }: { order: Order }) {
    const isOnTheWay = order.status === 'on_the_way';

    return (
        <View className="mb-4 rounded-3xl bg-white/80 p-4">
            {/* Header row */}
            <View className="flex-row items-center justify-between mb-3">
                <View>
                    <Text className="text-base font-lufga-semibold text-slate-900">Order ID: {order.id}</Text>
                    <Text className="text-xs font-lufga text-slate-400 mt-0.5">{order.date}</Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            {/* Items + Price */}
            <View className="flex-row justify-between bg-slate-50 rounded-2xl px-4 py-3 mb-3">
                <Text className="text-sm font-lufga text-slate-700">Items:  <Text className="font-lufga-semibold">{order.items}</Text></Text>
                <Text className="text-sm font-lufga text-slate-700">Price:  <Text className="font-lufga-semibold">{order.price.toLocaleString()}</Text></Text>
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
                    {MOCK_ORDERS.map((order, i) => (
                        <OrderCard key={i} order={order} />
                    ))}
                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
