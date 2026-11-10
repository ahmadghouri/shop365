import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
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
    Car,
    ChevronRight,
    Clock,
    Navigation,
    Package,
    Phone,
    Power,
    ShoppingBag,
    Wallet,
} from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { BOTTOM_NAV_SPACE, BottomNav, type TabKey } from '@/components/reusable/BottomNav';
import { StatusBadge } from '@/components/reusable/StatusBadge';
import { useAuthStore } from '@/lib/authStore';
import { DeliveryMapPage } from '@/pages/DeliveryMapPage';
import { RiderOrdersPage } from '@/pages/RiderOrdersPage';
import { RiderWalletPage } from '@/pages/RiderWalletPage';
import { RiderProfilePage } from '@/pages/RiderProfilePage';
import { useLiveLocation } from '@/lib/useLiveLocation';
import { CancelDeliveryModal } from '@/components/CancelDeliveryModal';
import {
    useCancelDelivery,
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

const INCOMING = ['pending', 'confirmed', 'preparing'];
const ONGOING = ['picked_up', 'out_for_delivery'];

function money(n: number) {
    return `Rs ${Number(n || 0).toLocaleString()}`;
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function timeAgo(iso?: string) {
    if (!iso) return '';
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.round(hrs / 24)} d ago`;
}

function itemSummary(order: RiderOrder) {
    const count = order.items.reduce((n, i) => n + (i.quantity || 0), 0);
    const first = order.items[0]?.product_id?.title;
    if (!first) return `${count} item${count === 1 ? '' : 's'}`;
    return order.items.length > 1 ? `${first} +${order.items.length - 1} more` : `${count} × ${first}`;
}

export function RiderHomePage() {
    const rider = useAuthStore((s) => s.rider);
    const logout = useAuthStore((s) => s.logout);
    const [online, setOnline] = useState(true);
    // Order whose in-app delivery map is open (null = home screen).
    const [mapOrderId, setMapOrderId] = useState<string | null>(null);
    // Order the rider is dropping (cancel-delivery sheet open).
    const [cancelOrder, setCancelOrder] = useState<RiderOrder | null>(null);
    const cancelDelivery = useCancelDelivery();
    const [tab, setTab] = useState<TabKey>('home');
    // Requests this rider chose to skip (hidden only on this phone).
    const [skipped, setSkipped] = useState<string[]>([]);

    const { data: orders = [], isLoading, isError, refetch, isRefetching } = useRiderOrders();
    const updateStatus = useUpdateRiderOrderStatus();

    // No polling — reload once whenever the rider returns to the app.
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') refetch();
        });
        return () => sub.remove();
    }, [refetch]);

    const incoming = useMemo(
        () => orders.filter((o) => INCOMING.includes(o.status) && !skipped.includes(o._id)),
        [orders, skipped]
    );
    const ongoing = useMemo(() => orders.filter((o) => ONGOING.includes(o.status)), [orders]);
    const cashToCollect = useMemo(
        () => ongoing.reduce((sum, o) => sum + (o.total_price || 0), 0),
        [ongoing]
    );

    const setStatus = (order: RiderOrder, status: RiderOrderStatus, onSuccess?: () => void) => {
        updateStatus.mutate(
            { orderId: order._id, status },
            {
                onSuccess: () => onSuccess?.(),
                onError: (err: any) =>
                    Alert.alert(
                        'Could not update',
                        err?.response?.data?.message || 'Please try again.'
                    ),
            }
        );
    };

    // Accept a request. The backend refuses if the rider already has a delivery.
    const accept = (order: RiderOrder) => {
        updateStatus.mutate(
            { orderId: order._id, status: 'picked_up' },
            {
                onError: (err: any) => {
                    Alert.alert(
                        'Could not accept',
                        err?.response?.data?.message || 'Please try again.'
                    );
                    refetch();
                },
            }
        );
    };

    const advance = (order: RiderOrder) => {
        const action = NEXT_ACTION[order.status];
        if (!action) return;
        if (action.status === 'delivered') {
            Alert.alert(
                'Confirm delivery',
                `Collect ${money(order.total_price)} and mark this order as delivered?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delivered',
                        onPress: () => setStatus(order, 'delivered', () => setMapOrderId(null)),
                    },
                ]
            );
        } else if (action.status === 'out_for_delivery') {
            // Start Delivery → open the in-app delivery map.
            setStatus(order, action.status, () => setMapOrderId(order._id));
        } else {
            setStatus(order, action.status);
        }
    };

    const mapOrder = mapOrderId ? orders.find((o) => o._id === mapOrderId) : undefined;

    // Once a delivery has started ("Start Delivery"), keep sharing the rider's
    // GPS with the customer even when the map isn't open. The map page runs
    // its own tracker, so this one pauses while the map is showing.
    const deliveryInProgress = ongoing.some((o) => o.status === 'out_for_delivery');
    useLiveLocation(deliveryInProgress && !mapOrder);

    const submitCancel = (reason: string) => {
        if (!cancelOrder) return;
        cancelDelivery.mutate(
            { orderId: cancelOrder._id, reason },
            {
                onSuccess: () => {
                    setCancelOrder(null);
                    setMapOrderId(null);
                    Alert.alert(
                        'Delivery cancelled',
                        'The restaurant has been notified and will arrange the order.'
                    );
                },
            }
        );
    };

    const cancelSheet = (
        <CancelDeliveryModal
            visible={!!cancelOrder}
            orderLabel={cancelOrder ? `#${cancelOrder._id.slice(-6).toUpperCase()}` : ''}
            busy={cancelDelivery.isPending}
            error={
                cancelDelivery.isError
                    ? (cancelDelivery.error as any)?.response?.data?.message || 'Could not cancel. Try again.'
                    : undefined
            }
            onClose={() => {
                setCancelOrder(null);
                cancelDelivery.reset();
            }}
            onSubmit={submitCancel}
        />
    );

    const VehicleIcon = rider?.vehicle_type === 'car' ? Car : Bike;

    const notReady = (
        <View
            className="flex-1 items-center justify-center px-8"
            style={{ paddingBottom: BOTTOM_NAV_SPACE }}
        >
            <View className="h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                <Clock size={32} color="#b77900" />
            </View>
            <Text className="mt-4 text-lg font-bold text-slate-900">Coming soon</Text>
            <Text className="mt-1 text-center text-sm text-slate-500">
                This section isn&apos;t built yet.
            </Text>
        </View>
    );

    if (mapOrder) {
        return (
            <>
                <DeliveryMapPage
                    order={mapOrder}
                    busy={updateStatus.isPending}
                    onBack={() => setMapOrderId(null)}
                    onMarkDelivered={() => advance(mapOrder)}
                    onCancelDelivery={() => setCancelOrder(mapOrder)}
                />
                {cancelSheet}
            </>
        );
    }

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {tab === 'home' ? (
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_SPACE }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={() => {
                                    refetch();
                                }}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        {/* Header */}
                        <View className="flex-row items-center px-5 pt-3">
                            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-amber-50">
                                {rider?.image ? (
                                    <Image
                                        source={{ uri: rider.image }}
                                        className="h-14 w-14"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-xl font-bold text-[#b77900]">
                                        {(rider?.name?.[0] ?? 'R').toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View className="ml-3 flex-1 min-w-0">
                                <Text className="text-sm text-slate-500">{greeting()} 👋</Text>
                                <Text className="text-xl font-bold text-slate-950" numberOfLines={1}>
                                    {rider?.name || 'Rider'}
                                </Text>
                            </View>
                            <Pressable className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-white bg-white/60 active:opacity-70">
                                <Bell size={20} color="#171717" />
                            </Pressable>
                        </View>

                        {/* Online status hero */}
                        <View className="mx-5 mt-5">
                            {online ? (
                                <GradientPill className="rounded-[28px]">
                                    <View className="p-5">
                                        <View className="flex-row items-center">
                                            <View className="flex-1">
                                                <View className="flex-row items-center">
                                                    <View className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                                    <Text className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-800">
                                                        Online
                                                    </Text>
                                                </View>
                                                <Text className="mt-1 text-2xl font-bold text-slate-950">
                                                    You&apos;re on duty
                                                </Text>
                                                <Text className="mt-0.5 text-sm text-slate-800">
                                                    Receiving delivery requests
                                                </Text>
                                            </View>
                                            <Pressable
                                                onPress={() => setOnline(false)}
                                                className="h-16 w-16 items-center justify-center rounded-full bg-slate-950 active:opacity-80"
                                            >
                                                <Power size={26} color="#EAB308" />
                                            </Pressable>
                                        </View>
                                        <View className="mt-4 flex-row items-center self-start rounded-full bg-white/50 px-3 py-1.5">
                                            <VehicleIcon size={14} color="#111827" />
                                            <Text className="ml-1.5 text-xs font-semibold text-slate-900">
                                                {rider?.vehicle_type === 'car' ? 'Car' : 'Bike'}
                                                {rider?.vehicle_no ? ` · ${rider.vehicle_no}` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                </GradientPill>
                            ) : (
                                <GlassCard className="rounded-[28px] p-5">
                                    <View className="flex-row items-center">
                                        <View className="flex-1">
                                            <View className="flex-row items-center">
                                                <View className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                                                <Text className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    Offline
                                                </Text>
                                            </View>
                                            <Text className="mt-1 text-2xl font-bold text-slate-950">
                                                You&apos;re off duty
                                            </Text>
                                            <Text className="mt-0.5 text-sm text-slate-500">
                                                Go online to start receiving orders
                                            </Text>
                                        </View>
                                    </View>
                                    <Pressable
                                        className="mt-4 active:opacity-80"
                                        onPress={() => setOnline(true)}
                                    >
                                        <GradientPill className="h-12 rounded-full">
                                            <View className="flex-1 flex-row items-center justify-center">
                                                <Power size={18} color="#171717" />
                                                <Text className="ml-2 text-base font-bold text-slate-950">
                                                    Go Online
                                                </Text>
                                            </View>
                                        </GradientPill>
                                    </Pressable>
                                </GlassCard>
                            )}
                        </View>

                        {/* Stats */}
                        <View className="mx-5 mt-4 flex-row gap-3">
                            <StatTile
                                icon={<ShoppingBag size={18} color="#b77900" />}
                                value={`${online ? incoming.length : 0}`}
                                label="New requests"
                            />
                            <StatTile
                                icon={<Package size={18} color="#b77900" />}
                                value={`${ongoing.length}`}
                                label="On the way"
                            />
                            <StatTile
                                icon={<Wallet size={18} color="#b77900" />}
                                value={money(cashToCollect)}
                                label="To collect"
                            />
                        </View>

                        {isLoading ? (
                            <View className="items-center py-16">
                                <ActivityIndicator size="large" color="#EAB308" />
                            </View>
                        ) : isError ? (
                            <View className="mx-5 mt-6">
                                <GlassCard className="items-center py-8">
                                    <Text className="text-slate-500">Could not load deliveries.</Text>
                                    <Pressable onPress={() => refetch()} className="mt-3 active:opacity-80">
                                        <GradientPill className="rounded-full">
                                            <Text className="px-6 py-2.5 font-semibold text-slate-950">
                                                Retry
                                            </Text>
                                        </GradientPill>
                                    </Pressable>
                                </GlassCard>
                            </View>
                        ) : (
                            <>
                                {/* Ongoing deliveries — always shown, even when offline */}
                                {ongoing.length > 0 ? (
                                    <>
                                        <SectionTitle title="Ongoing deliveries" count={ongoing.length} />
                                        {ongoing.map((order) => (
                                            <OngoingCard
                                                key={order._id}
                                                order={order}
                                                busy={updateStatus.isPending}
                                                onAdvance={() => advance(order)}
                                                onOpenMap={() => setMapOrderId(order._id)}
                                                onCancel={() => setCancelOrder(order)}
                                            />
                                        ))}
                                    </>
                                ) : null}

                                {/* New requests — only when the rider is free (one order at a time) */}
                                {online && ongoing.length > 0 ? (
                                    <GlassCard className="mx-5 mt-4 flex-row items-center rounded-[24px]">
                                        <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                                            <Clock size={18} color="#b77900" />
                                        </View>
                                        <Text className="ml-3 flex-1 text-sm text-slate-600">
                                            Finish your current delivery to receive new requests.
                                        </Text>
                                    </GlassCard>
                                ) : online ? (
                                    incoming.length > 0 ? (
                                        <>
                                            <SectionTitle title="New requests" count={incoming.length} />
                                            {incoming.map((order) => (
                                                <RequestCard
                                                    key={order._id}
                                                    order={order}
                                                    busy={updateStatus.isPending}
                                                    onAccept={() => accept(order)}
                                                    onSkip={() => setSkipped((s) => [...s, order._id])}
                                                />
                                            ))}
                                        </>
                                    ) : ongoing.length === 0 ? (
                                        <EmptyState
                                            title="Waiting for new orders"
                                            subtitle="Stay online — new requests appear here. Pull down to refresh."
                                        />
                                    ) : null
                                ) : ongoing.length === 0 ? (
                                    <EmptyState
                                        title="You're offline"
                                        subtitle="Go online to see new delivery requests."
                                        offline
                                    />
                                ) : null}
                            </>
                        )}
                    </ScrollView>
                ) : tab === 'orders' ? (
                    <RiderOrdersPage
                        activeOrders={ongoing}
                        loadingActive={isLoading}
                        onRefreshActive={() => {
                            refetch();
                        }}
                        renderActiveCard={(order) => (
                            <OngoingCard
                                order={order}
                                busy={updateStatus.isPending}
                                onAdvance={() => advance(order)}
                                onOpenMap={() => setMapOrderId(order._id)}
                                onCancel={() => setCancelOrder(order)}
                            />
                        )}
                    />
                ) : tab === 'wallet' ? (
                    <RiderWalletPage />
                ) : tab === 'profile' ? (
                    <RiderProfilePage />
                ) : (
                    notReady
                )}

                {cancelSheet}

                <BottomNav
                    active={tab}
                    onChange={setTab}
                />
            </SafeAreaView>
        </AppBackground>
    );
}

/* ---------- Pieces ---------- */

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <GlassCard className="flex-1 px-3 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="mt-3 text-lg font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                {label}
            </Text>
        </GlassCard>
    );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
    return (
        <View className="mx-5 mb-3 mt-7 flex-row items-center">
            <Text className="text-lg font-bold text-slate-950">{title}</Text>
            {count ? (
                <View className="ml-2 h-6 min-w-6 items-center justify-center rounded-full bg-slate-950 px-2">
                    <Text className="text-xs font-bold text-[#EAB308]">{count}</Text>
                </View>
            ) : null}
        </View>
    );
}

/** Pickup → drop-off route block used on both cards. */
function RouteBlock({ order }: { order: RiderOrder }) {
    return (
        <View className="mt-4">
            <View className="flex-row">
                <View className="items-center" style={{ width: 20 }}>
                    <View className="mt-1 h-3 w-3 rounded-full border-2 border-[#EAB308] bg-white" />
                    <View className="my-1 w-0.5 flex-1 bg-amber-200" />
                </View>
                <View className="ml-2 flex-1 pb-3">
                    <Text className="text-[11px] uppercase tracking-wider text-slate-400">Pickup</Text>
                    <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                        {itemSummary(order)}
                    </Text>
                </View>
            </View>
            <View className="flex-row">
                <View className="items-center" style={{ width: 20 }}>
                    <View className="mt-1 h-3 w-3 rounded-full bg-slate-950" />
                </View>
                <View className="ml-2 flex-1">
                    <Text className="text-[11px] uppercase tracking-wider text-slate-400">Drop-off</Text>
                    <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                        {order.user?.name || 'Customer'}
                    </Text>
                    {order.user?.address ? (
                        <Text className="text-xs text-slate-500" numberOfLines={2}>
                            {order.user.address}
                        </Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

function RequestCard({
    order,
    busy,
    onAccept,
    onSkip,
}: {
    order: RiderOrder;
    busy: boolean;
    onAccept: () => void;
    onSkip: () => void;
}) {
    const earn = order.delivery_fee || 0;
    return (
        <GlassCard className="mx-5 mb-3 rounded-[28px] p-5">
            <View className="flex-row items-start">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                    <ShoppingBag size={22} color="#b77900" />
                </View>
                <View className="ml-3 flex-1 min-w-0">
                    <Text className="text-base font-bold text-slate-950" numberOfLines={1}>
                        Order #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <View className="mt-0.5 flex-row items-center">
                        <Clock size={12} color="#94a3b8" />
                        <Text className="ml-1 text-xs text-slate-400">{timeAgo(order.createdAt)}</Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-[11px] text-slate-400">{earn ? 'You earn' : 'Order total'}</Text>
                    <Text className="text-lg font-bold text-slate-950">
                        {money(earn || order.total_price)}
                    </Text>
                </View>
            </View>

            <RouteBlock order={order} />

            <View className="mt-5 flex-row gap-3">
                <Pressable
                    className="h-12 flex-1 items-center justify-center rounded-full border-[1.5px] border-white bg-white/70 active:opacity-70"
                    disabled={busy}
                    onPress={onSkip}
                >
                    <Text className="text-sm font-bold text-slate-700">Skip</Text>
                </Pressable>
                <Pressable className="flex-[1.6] active:opacity-80" disabled={busy} onPress={onAccept}>
                    <GradientPill className="h-12 rounded-full">
                        <View className="flex-1 flex-row items-center justify-center">
                            <Text className="text-sm font-bold text-slate-950">
                                {busy ? 'Please wait…' : 'Accept Order'}
                            </Text>
                            {!busy ? <ChevronRight size={18} color="#171717" style={{ marginLeft: 2 }} /> : null}
                        </View>
                    </GradientPill>
                </Pressable>
            </View>
        </GlassCard>
    );
}

function OngoingCard({
    order,
    busy,
    onAdvance,
    onOpenMap,
    onCancel,
}: {
    order: RiderOrder;
    busy: boolean;
    onAdvance: () => void;
    onOpenMap: () => void;
    onCancel: () => void;
}) {
    const action = NEXT_ACTION[order.status];
    return (
        <GlassCard className="mx-5 mb-3 rounded-[28px] p-5">
            <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-slate-950">
                    #{order._id.slice(-6).toUpperCase()}
                </Text>
                <StatusBadge status={order.status} />
            </View>

            <RouteBlock order={order} />

            <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                <View className="flex-row items-center">
                    <Wallet size={16} color="#b77900" />
                    <Text className="ml-2 text-sm text-slate-700">Collect from customer</Text>
                </View>
                <Text className="text-base font-bold text-slate-950">{money(order.total_price)}</Text>
            </View>

            <View className="mt-4 flex-row items-center gap-2">
                {order.user?.phone_no ? (
                    <Pressable
                        onPress={() => Linking.openURL(`tel:${order.user.phone_no}`)}
                        className="h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-white bg-white/70 active:opacity-70"
                    >
                        <Phone size={18} color="#b77900" />
                    </Pressable>
                ) : null}
                {/* In-app delivery map */}
                <Pressable
                    onPress={onOpenMap}
                    className="h-12 flex-row items-center justify-center rounded-full border-[1.5px] border-white bg-white/70 px-4 active:opacity-70"
                >
                    <Navigation size={18} color="#b77900" />
                    <Text className="ml-1.5 text-sm font-semibold text-slate-800">Map</Text>
                </Pressable>
                {action ? (
                    <Pressable className="flex-1 active:opacity-80" disabled={busy} onPress={onAdvance}>
                        <GradientPill className="h-12 rounded-full">
                            <View className="flex-1 flex-row items-center justify-center">
                                <Text className="text-sm font-bold text-slate-950">
                                    {busy ? 'Please wait…' : action.label}
                                </Text>
                                {!busy ? <ChevronRight size={18} color="#171717" style={{ marginLeft: 2 }} /> : null}
                            </View>
                        </GradientPill>
                    </Pressable>
                ) : null}
            </View>

            <Pressable onPress={onCancel} disabled={busy} className="mt-3 items-center py-1 active:opacity-60">
                <Text className="text-sm font-semibold text-red-600">Cancel delivery</Text>
            </Pressable>
        </GlassCard>
    );
}

function EmptyState({ title, subtitle, offline }: { title: string; subtitle: string; offline?: boolean }) {
    return (
        <GlassCard className="mx-5 mt-7 items-center rounded-[28px] py-10">
            <View
                className={`h-20 w-20 items-center justify-center rounded-full ${offline ? 'bg-slate-100' : 'bg-amber-50'}`}
            >
                {offline ? <Power size={32} color="#94a3b8" /> : <Bike size={34} color="#b77900" />}
            </View>
            <Text className="mt-4 text-base font-bold text-slate-900">{title}</Text>
            <Text className="mt-1 px-8 text-center text-sm text-slate-500">{subtitle}</Text>
        </GlassCard>
    );
}
