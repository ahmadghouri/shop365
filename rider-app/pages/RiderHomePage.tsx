import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Bell,
    Bike,
    CheckCircle2,
    ChevronRight,
    HelpCircle,
    Gift,
    MapPin,
    Package,
    Phone,
    Power,
    Star,
    Store,
    Wallet,
} from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { MapCard } from '@/components/reusable/MapCard';
import { QuickActionCard } from '@/components/reusable/QuickActionCard';
import { BottomNav, type TabKey } from '@/components/reusable/BottomNav';
import { StatusBadge } from '@/components/reusable/StatusBadge';
import { useAuthStore } from '@/lib/authStore';
import {
    useRiderOrders,
    useUpdateRiderOrderStatus,
    type RiderOrder,
    type RiderOrderStatus,
} from '@/lib/riderOrders';

const NEXT_ACTION: Record<string, { label: string; status: RiderOrderStatus } | undefined> = {
    pending: { label: 'Accept Order', status: 'picked_up' },
    confirmed: { label: 'Mark Picked Up', status: 'picked_up' },
    preparing: { label: 'Mark Picked Up', status: 'picked_up' },
    picked_up: { label: 'Start Delivery', status: 'out_for_delivery' },
    out_for_delivery: { label: 'Mark Delivered', status: 'delivered' },
};

function money(n: number) {
    return `Rs ${Number(n || 0).toLocaleString()}`;
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export function RiderHomePage() {
    const rider = useAuthStore((s) => s.rider);
    const logout = useAuthStore((s) => s.logout);
    const [online, setOnline] = useState(true);
    const [tab, setTab] = useState<TabKey>('home');

    const { data: orders = [], isLoading, isError, refetch, isRefetching } = useRiderOrders();
    const updateStatus = useUpdateRiderOrderStatus();

    const activeOrders = useMemo(
        () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
        [orders]
    );
    const deliveredCount = useMemo(
        () => orders.filter((o) => o.status === 'delivered').length,
        [orders]
    );
    const earnings = useMemo(
        () =>
            orders
                .filter((o) => o.status === 'delivered')
                .reduce((sum, o) => sum + (o.delivery_fee || 0), 0),
        [orders]
    );

    // The first not-yet-accepted request (shown as a delivery request card).
    const incoming = useMemo(
        () => activeOrders.find((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)),
        [activeOrders]
    );
    const ongoing = useMemo(
        () => activeOrders.filter((o) => ['picked_up', 'out_for_delivery'].includes(o.status)),
        [activeOrders]
    );

    const setStatus = (order: RiderOrder, status: RiderOrderStatus) => {
        updateStatus.mutate(
            { orderId: order._id, status },
            {
                onError: (err: any) =>
                    Alert.alert(
                        'Could not update',
                        err?.response?.data?.message || 'Please try again.'
                    ),
            }
        );
    };

    const advance = (order: RiderOrder) => {
        const action = NEXT_ACTION[order.status];
        if (!action) return;
        if (action.status === 'delivered') {
            Alert.alert('Confirm delivery', 'Mark this order as delivered?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delivered', onPress: () => setStatus(order, 'delivered') },
            ]);
        } else {
            setStatus(order, action.status);
        }
    };

    const notReady = (
        <View className="flex-1 items-center justify-center px-8 py-24">
            <Text className="text-lg font-bold text-slate-800">Coming soon</Text>
            <Text className="mt-1 text-center text-sm text-slate-500">
                This section isn&apos;t built yet.
            </Text>
        </View>
    );

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {tab === 'home' ? (
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        {/* 1. Header */}
                        <View className="flex-row items-center px-4 pt-2">
                            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white bg-slate-100">
                                {rider?.image ? (
                                    <Image
                                        source={{ uri: rider.image }}
                                        className="h-12 w-12"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-base font-bold text-slate-400">
                                        {(rider?.name?.[0] ?? 'R').toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View className="ml-3 flex-1 min-w-0">
                                <Text className="text-xs text-slate-500">{greeting()},</Text>
                                <Text
                                    className="text-lg font-bold text-slate-900"
                                    numberOfLines={1}
                                >
                                    {rider?.name || 'Rider'}
                                </Text>
                                <View className="mt-0.5 flex-row items-center">
                                    <MapPin size={12} color="#b77900" />
                                    <Text className="ml-1 text-xs text-slate-500" numberOfLines={1}>
                                        Haroonabad, Pakistan
                                    </Text>
                                </View>
                            </View>
                            <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/60 active:opacity-70">
                                <Bell size={20} color="#171717" />
                                <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
                            </Pressable>
                        </View>

                        {/* 2. Availability card */}
                        <View className="mx-4 mt-4">
                            <GlassCard variant="dark">
                                <View className="flex-row items-center">
                                    <View
                                        className={`h-12 w-12 items-center justify-center rounded-full ${online ? 'bg-[#EAB308]' : 'bg-slate-700'
                                            }`}
                                    >
                                        <Power size={22} color={online ? '#171717' : '#cbd5e1'} />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-base font-bold text-white">
                                            {online ? 'You are Online' : 'You are Offline'}
                                        </Text>
                                        <Text className="text-xs text-slate-400">
                                            {online ? 'Working since 9:00 AM' : 'Tap to start earning'}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setOnline((v) => !v)}
                                        className={`h-8 w-14 justify-center rounded-full px-1 ${online ? 'bg-[#EAB308]' : 'bg-slate-600'
                                            }`}
                                    >
                                        <View
                                            className={`h-6 w-6 rounded-full bg-white ${online ? 'self-end' : 'self-start'
                                                }`}
                                        />
                                    </Pressable>
                                </View>
                            </GlassCard>
                        </View>

                        {/* 3. Earnings summary */}
                        <View className="mx-4 mt-3">
                            <GlassCard>
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-xs text-slate-500">
                                            Today&apos;s Earnings
                                        </Text>
                                        <Text className="text-2xl font-bold text-slate-900">
                                            {money(earnings)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center rounded-full bg-white/70 px-3 py-1.5">
                                        <Star size={14} color="#EAB308" />
                                        <Text className="ml-1 text-sm font-bold text-slate-900">
                                            4.8
                                        </Text>
                                    </View>
                                </View>
                                <View className="mt-4 h-px bg-white" />
                                <View className="mt-4 flex-row justify-between">
                                    <SummaryStat
                                        icon={<Package size={16} color="#b77900" />}
                                        value={`${deliveredCount}`}
                                        label="Deliveries"
                                    />
                                    <SummaryStat
                                        icon={<Bike size={16} color="#b77900" />}
                                        value={`${activeOrders.length}`}
                                        label="Active"
                                    />
                                    <SummaryStat
                                        icon={<MapPin size={16} color="#b77900" />}
                                        value="25 KM"
                                        label="Distance"
                                    />
                                </View>
                            </GlassCard>
                        </View>

                        {/* 4. Live map */}
                        <View className="mx-4 mt-4">
                            <MapCard onRecenter={() => { }} />
                        </View>

                        {/* 5. Active delivery / request */}
                        <Text className="mx-4 mt-6 text-base font-bold text-slate-900">
                            {incoming ? 'New Delivery Request' : 'Active Delivery'}
                        </Text>

                        {isLoading ? (
                            <View className="items-center py-10">
                                <ActivityIndicator size="large" color="#EAB308" />
                            </View>
                        ) : isError ? (
                            <View className="mx-4 mt-3">
                                <GlassCard className="items-center py-8">
                                    <Text className="text-slate-500">
                                        Could not load deliveries.
                                    </Text>
                                    <Pressable
                                        onPress={() => refetch()}
                                        className="mt-3 rounded-full bg-amber-50 px-6 py-2.5"
                                    >
                                        <Text className="font-semibold text-amber-700">Retry</Text>
                                    </Pressable>
                                </GlassCard>
                            </View>
                        ) : !online ? (
                            <View className="mx-4 mt-3">
                                <GlassCard className="items-center py-10">
                                    <Power size={30} color="#94a3b8" />
                                    <Text className="mt-3 font-semibold text-slate-700">
                                        You&apos;re offline
                                    </Text>
                                    <Text className="mt-1 text-xs text-slate-400">
                                        Go online to receive requests.
                                    </Text>
                                </GlassCard>
                            </View>
                        ) : incoming ? (
                            <View className="mx-4 mt-3">
                                <GlassCard>
                                    <View className="flex-row items-center">
                                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                                            <Store size={24} color="#b77900" />
                                        </View>
                                        <View className="ml-3 flex-1 min-w-0">
                                            <Text
                                                className="text-sm font-bold text-slate-900"
                                                numberOfLines={1}
                                            >
                                                {incoming.items[0]?.product_id?.title
                                                    ? 'Order pickup'
                                                    : 'New order'}{' '}
                                                #{incoming._id.slice(-6).toUpperCase()}
                                            </Text>
                                            <Text className="text-xs text-slate-500" numberOfLines={1}>
                                                {incoming.user?.name || 'Customer'}
                                            </Text>
                                        </View>
                                        <Text className="text-base font-bold text-slate-900">
                                            {money(incoming.delivery_fee || incoming.total_price)}
                                        </Text>
                                    </View>

                                    <View className="mt-3 flex-row justify-between rounded-2xl bg-white/60 p-3">
                                        <RequestMeta label="Pickup" value="1.2 km" />
                                        <RequestMeta label="Dropoff" value="3.4 km" />
                                        <RequestMeta label="Est. time" value="20 min" />
                                    </View>

                                    <View className="mt-3 flex-row gap-2">
                                        <Pressable
                                            className="flex-1 items-center justify-center rounded-full border border-slate-300 bg-white py-3 active:opacity-70"
                                            disabled={updateStatus.isPending}
                                            onPress={() => setStatus(incoming, 'cancelled')}
                                        >
                                            <Text className="text-sm font-bold text-slate-700">
                                                Reject
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            className="flex-1 active:opacity-80"
                                            disabled={updateStatus.isPending}
                                            onPress={() => setStatus(incoming, 'picked_up')}
                                        >
                                            <GradientPill className="h-11 rounded-full">
                                                <View className="flex-1 items-center justify-center">
                                                    <Text className="text-sm font-bold text-slate-950">
                                                        {updateStatus.isPending
                                                            ? 'Please wait…'
                                                            : 'Accept Order'}
                                                    </Text>
                                                </View>
                                            </GradientPill>
                                        </Pressable>
                                    </View>
                                </GlassCard>
                            </View>
                        ) : ongoing.length > 0 ? (
                            <View className="mx-4 mt-3">
                                {ongoing.map((order) => {
                                    const action = NEXT_ACTION[order.status];
                                    return (
                                        <GlassCard key={order._id} className="mb-3">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-sm font-bold text-slate-900">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </Text>
                                                <StatusBadge status={order.status} />
                                            </View>
                                            <Text className="mt-3 text-sm font-semibold text-slate-900">
                                                {order.user?.name || 'Customer'}
                                            </Text>
                                            {order.user?.address ? (
                                                <View className="mt-1 flex-row items-start gap-1.5">
                                                    <MapPin
                                                        size={14}
                                                        color="#64748b"
                                                        style={{ marginTop: 2 }}
                                                    />
                                                    <Text
                                                        className="flex-1 text-xs text-slate-500"
                                                        numberOfLines={2}
                                                    >
                                                        {order.user.address}
                                                    </Text>
                                                </View>
                                            ) : null}
                                            <View className="mt-3 flex-row items-center gap-2">
                                                {order.user?.phone_no ? (
                                                    <Pressable
                                                        onPress={() =>
                                                            Linking.openURL(
                                                                `tel:${order.user.phone_no}`
                                                            )
                                                        }
                                                        className="h-11 w-11 items-center justify-center rounded-full bg-[#141414] active:opacity-70"
                                                    >
                                                        <Phone size={18} color="#EAB308" />
                                                    </Pressable>
                                                ) : null}
                                                {action ? (
                                                    <Pressable
                                                        className="flex-1 active:opacity-80"
                                                        disabled={updateStatus.isPending}
                                                        onPress={() => advance(order)}
                                                    >
                                                        <GradientPill className="h-11 rounded-full">
                                                            <View className="flex-1 flex-row items-center justify-center">
                                                                <Text className="text-sm font-bold text-slate-950">
                                                                    {action.label}
                                                                </Text>
                                                                <ChevronRight
                                                                    size={18}
                                                                    color="#171717"
                                                                    style={{ marginLeft: 4 }}
                                                                />
                                                            </View>
                                                        </GradientPill>
                                                    </Pressable>
                                                ) : null}
                                            </View>
                                        </GlassCard>
                                    );
                                })}
                            </View>
                        ) : (
                            <View className="mx-4 mt-3">
                                <GlassCard className="items-center py-10">
                                    <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                                        <Bike size={30} color="#b77900" />
                                    </View>
                                    <Text className="mt-3 font-semibold text-slate-700">
                                        Waiting for new orders
                                    </Text>
                                    <Text className="mt-1 text-center text-xs text-slate-400">
                                        You&apos;ll be notified when a delivery is assigned.
                                    </Text>
                                </GlassCard>
                            </View>
                        )}

                        {/* 6. Quick actions */}
                        <Text className="mx-4 mt-6 mb-3 text-base font-bold text-slate-900">
                            Quick Actions
                        </Text>
                        <View className="mx-4 flex-row flex-wrap justify-between">
                            <QuickActionCard
                                label="My Orders"
                                icon={<Package size={20} color="#b77900" />}
                                onPress={() => setTab('orders')}
                            />
                            <QuickActionCard
                                label="Earnings"
                                icon={<Wallet size={20} color="#b77900" />}
                                onPress={() => setTab('wallet')}
                            />
                            <QuickActionCard
                                label="Rewards"
                                icon={<Gift size={20} color="#b77900" />}
                            />
                            <QuickActionCard
                                label="Help & Support"
                                icon={<HelpCircle size={20} color="#b77900" />}
                            />
                        </View>
                    </ScrollView>
                ) : (
                    notReady
                )}

                {/* 7. Bottom navigation */}
                <BottomNav
                    active={tab}
                    onChange={(k) => {
                        if (k === 'profile') {
                            Alert.alert('Logout', 'Do you want to logout?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Logout', onPress: logout },
                            ]);
                            return;
                        }
                        setTab(k);
                    }}
                />
            </SafeAreaView>
        </AppBackground>
    );
}

function SummaryStat({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <View className="items-center">
            <View className="mb-1 flex-row items-center">{icon}</View>
            <Text className="text-base font-bold text-slate-900">{value}</Text>
            <Text className="text-[11px] text-slate-400">{label}</Text>
        </View>
    );
}

function RequestMeta({ label, value }: { label: string; value: string }) {
    return (
        <View className="items-center">
            <Text className="text-[11px] text-slate-400">{label}</Text>
            <Text className="mt-0.5 text-sm font-bold text-slate-900">{value}</Text>
        </View>
    );
}
