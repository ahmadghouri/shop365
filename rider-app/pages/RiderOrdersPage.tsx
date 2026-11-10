import { useMemo, useState, type ReactNode } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    SectionList,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Bike,
    CheckCircle2,
    ChevronRight,
    Clock,
    MapPin,
    Package,
    Store,
    Wallet,
    X,
    XCircle,
} from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { BOTTOM_NAV_SPACE } from '@/components/reusable/BottomNav';
import {
    useRiderOrderHistory,
    type RiderHistoryOrder,
    type RiderOrder,
} from '@/lib/riderOrders';

type Props = {
    activeOrders: RiderOrder[];
    loadingActive: boolean;
    /** Home page's ongoing-delivery card (map / next step / cancel). */
    renderActiveCard: (order: RiderOrder) => ReactNode;
    onRefreshActive: () => void;
};

type Tab = 'active' | 'history';

const money = (n: number) => `Rs ${Number(n || 0).toLocaleString()}`;

const timeOf = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

function dayLabel(iso?: string | null) {
    if (!iso) return 'Earlier';
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (same(d, today)) return 'Today';
    if (same(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

const finishedAt = (o: RiderHistoryOrder) => o.delivered_at || o.dropped_at || o.createdAt;

/** Rider's Orders tab: ongoing deliveries + delivered / dropped history. */
export function RiderOrdersPage({ activeOrders, loadingActive, renderActiveCard, onRefreshActive }: Props) {
    const [tab, setTab] = useState<Tab>(activeOrders.length ? 'active' : 'history');
    const [selected, setSelected] = useState<RiderHistoryOrder | null>(null);

    const history = useRiderOrderHistory();
    const summary = history.data?.pages[0]?.summary;
    const historyOrders = useMemo(
        () => history.data?.pages.flatMap((p) => p.data) ?? [],
        [history.data]
    );

    // Group history by day (Today / Yesterday / date)
    const sections = useMemo(() => {
        const groups: { title: string; data: RiderHistoryOrder[]; earned: number }[] = [];
        for (const o of historyOrders) {
            const title = dayLabel(finishedAt(o));
            let g = groups.find((x) => x.title === title);
            if (!g) {
                g = { title, data: [], earned: 0 };
                groups.push(g);
            }
            g.data.push(o);
            if (o.outcome === 'delivered') g.earned += o.delivery_fee || 0;
        }
        return groups;
    }, [historyOrders]);

    const refreshing = history.isRefetching && !history.isFetchingNextPage;
    const onRefresh = () => {
        onRefreshActive();
        history.refetch();
    };

    const header = (
        <View>
            <View className="px-5 pt-3">
                <Text className="text-2xl font-bold text-slate-950">My Orders</Text>
                <Text className="text-sm text-slate-500">Your deliveries and earnings</Text>
            </View>

            {/* Earnings stats */}
            <View className="mx-5 mt-4 flex-row gap-3">
                <Stat icon={<Package size={17} color="#b77900" />} value={`${summary?.today_count ?? '—'}`} label="Today" />
                <Stat icon={<Wallet size={17} color="#b77900" />} value={summary ? money(summary.today_earnings) : '—'} label="Earned today" />
                <Stat icon={<CheckCircle2 size={17} color="#b77900" />} value={`${summary?.total_count ?? '—'}`} label="All time" />
            </View>

            {/* Tabs */}
            <View className="mx-5 mt-5 flex-row rounded-full bg-white/60 p-1">
                {(['active', 'history'] as Tab[]).map((t) => {
                    const on = tab === t;
                    return (
                        <Pressable
                            key={t}
                            onPress={() => setTab(t)}
                            className={`flex-1 flex-row items-center justify-center rounded-full py-2.5 ${on ? 'bg-slate-950' : ''}`}
                        >
                            <Text className={`text-sm font-semibold ${on ? 'text-white' : 'text-slate-600'}`}>
                                {t === 'active' ? 'Active' : 'History'}
                            </Text>
                            {t === 'active' && activeOrders.length ? (
                                <View className={`ml-1.5 rounded-full px-1.5 ${on ? 'bg-[#EAB308]' : 'bg-slate-200'}`}>
                                    <Text className="text-[11px] font-bold text-slate-950">{activeOrders.length}</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    // ---------- Active ----------
    if (tab === 'active') {
        return (
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: BOTTOM_NAV_SPACE }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#EAB308" colors={['#EAB308']} />}
                showsVerticalScrollIndicator={false}
            >
                {header}
                <View className="mt-5">
                    {loadingActive ? (
                        <ActivityIndicator className="py-12" color="#EAB308" />
                    ) : activeOrders.length ? (
                        activeOrders.map((o) => <View key={o._id}>{renderActiveCard(o)}</View>)
                    ) : (
                        <Empty
                            icon={<Bike size={30} color="#b77900" />}
                            title="No active deliveries"
                            subtitle="Accept a request on the Home tab to start delivering."
                        />
                    )}
                </View>
            </ScrollView>
        );
    }

    // ---------- History ----------
    return (
        <>
            <SectionList
                className="flex-1"
                sections={sections}
                keyExtractor={(o) => o._id}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{ paddingBottom: BOTTOM_NAV_SPACE }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EAB308" colors={['#EAB308']} />}
                ListHeaderComponent={header}
                renderSectionHeader={({ section }) => (
                    <View className="mx-5 mb-2 mt-6 flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-slate-900">{section.title}</Text>
                        {section.earned > 0 ? (
                            <Text className="text-xs font-semibold text-emerald-600">+{money(section.earned)}</Text>
                        ) : null}
                    </View>
                )}
                renderItem={({ item }) => <HistoryRow order={item} onPress={() => setSelected(item)} />}
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                    if (history.hasNextPage && !history.isFetchingNextPage) history.fetchNextPage();
                }}
                ListEmptyComponent={
                    history.isLoading ? (
                        <ActivityIndicator className="py-12" color="#EAB308" />
                    ) : history.isError ? (
                        <Empty
                            icon={<XCircle size={30} color="#dc2626" />}
                            title="Couldn't load history"
                            subtitle="Pull down to try again."
                        />
                    ) : (
                        <Empty
                            icon={<Clock size={30} color="#b77900" />}
                            title="No deliveries yet"
                            subtitle="Completed deliveries and your earnings show up here."
                        />
                    )
                }
                ListFooterComponent={
                    history.isFetchingNextPage ? <ActivityIndicator className="py-6" color="#EAB308" /> : undefined
                }
            />
            <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
        </>
    );
}

/* ---------------- pieces ---------------- */

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
    return (
        <GlassCard className="flex-1 px-3 py-3.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="mt-2 text-base font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                {label}
            </Text>
        </GlassCard>
    );
}

function Empty({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
    return (
        <GlassCard className="mx-5 mt-6 items-center rounded-[28px] py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="mt-3 text-base font-bold text-slate-900">{title}</Text>
            <Text className="mt-1 px-8 text-center text-sm text-slate-500">{subtitle}</Text>
        </GlassCard>
    );
}

function OutcomeBadge({ outcome }: { outcome: RiderHistoryOrder['outcome'] }) {
    const delivered = outcome === 'delivered';
    return (
        <View className={`flex-row items-center rounded-full px-2.5 py-1 ${delivered ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {delivered ? <CheckCircle2 size={12} color="#047857" /> : <XCircle size={12} color="#b91c1c" />}
            <Text className={`ml-1 text-[11px] font-semibold ${delivered ? 'text-emerald-700' : 'text-red-700'}`}>
                {delivered ? 'Delivered' : 'Dropped'}
            </Text>
        </View>
    );
}

function HistoryRow({ order, onPress }: { order: RiderHistoryOrder; onPress: () => void }) {
    const delivered = order.outcome === 'delivered';
    return (
        <Pressable onPress={onPress} className="active:opacity-80">
            <GlassCard className="mx-5 mb-2.5 flex-row items-center rounded-[22px] p-4">
                <View
                    className={`h-11 w-11 items-center justify-center rounded-2xl ${delivered ? 'bg-amber-50' : 'bg-red-50'}`}
                >
                    {delivered ? <Package size={20} color="#b77900" /> : <XCircle size={20} color="#dc2626" />}
                </View>
                <View className="ml-3 flex-1 min-w-0">
                    <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-slate-950">#{order._id.slice(-6).toUpperCase()}</Text>
                        <Text className="ml-2 text-xs text-slate-400">{timeOf(finishedAt(order))}</Text>
                    </View>
                    <Text className="text-xs text-slate-500" numberOfLines={1}>
                        {order.customer.name || 'Customer'}
                        {order.address ? ` · ${order.address}` : ''}
                    </Text>
                </View>
                <View className="ml-2 items-end">
                    {delivered ? (
                        <>
                            <Text className="text-sm font-bold text-emerald-600">+{money(order.delivery_fee)}</Text>
                            <Text className="text-[11px] text-slate-400">{money(order.total_price)} order</Text>
                        </>
                    ) : (
                        <OutcomeBadge outcome="dropped" />
                    )}
                </View>
                <ChevronRight size={16} color="#94a3b8" style={{ marginLeft: 4 }} />
            </GlassCard>
        </Pressable>
    );
}

function OrderDetailSheet({ order, onClose }: { order: RiderHistoryOrder | null; onClose: () => void }) {
    const insets = useSafeAreaInsets();
    if (!order) return null;
    const delivered = order.outcome === 'delivered';
    const itemsTotal = order.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <Pressable className="flex-1 bg-black/40" onPress={onClose} />
            <View className="max-h-[85%] rounded-t-[32px] bg-white" style={{ paddingBottom: insets.bottom + 16 }}>
                <View className="items-center pt-3">
                    <View className="h-1.5 w-12 rounded-full bg-slate-200" />
                </View>

                {/* Header */}
                <View className="flex-row items-start px-5 pt-4">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-950">Order #{order._id.slice(-6).toUpperCase()}</Text>
                        <Text className="text-xs text-slate-500">
                            {dayLabel(finishedAt(order))} · {timeOf(finishedAt(order))}
                        </Text>
                    </View>
                    <OutcomeBadge outcome={order.outcome} />
                    <Pressable onPress={onClose} className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <X size={16} color="#334155" />
                    </Pressable>
                </View>

                <ScrollView className="mt-4 px-5" showsVerticalScrollIndicator={false}>
                    {/* Earning */}
                    {delivered ? (
                        <View className="flex-row items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                            <Text className="text-sm text-emerald-800">You earned</Text>
                            <Text className="text-lg font-bold text-emerald-700">{money(order.delivery_fee)}</Text>
                        </View>
                    ) : (
                        <View className="rounded-2xl bg-red-50 px-4 py-3">
                            <Text className="text-sm font-semibold text-red-700">You dropped this delivery</Text>
                            {order.drop_reason ? (
                                <Text className="mt-0.5 text-sm text-red-600">Reason: “{order.drop_reason}”</Text>
                            ) : null}
                        </View>
                    )}

                    {/* Route */}
                    <View className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <View className="flex-row items-start">
                            <Store size={16} color="#b77900" style={{ marginTop: 2 }} />
                            <View className="ml-3 flex-1">
                                <Text className="text-[11px] uppercase tracking-wider text-slate-400">Pickup</Text>
                                <Text className="text-sm font-semibold text-slate-900">{order.business_name || 'Restaurant'}</Text>
                            </View>
                        </View>
                        <View className="ml-[7px] my-1.5 h-4 w-0.5 bg-amber-200" />
                        <View className="flex-row items-start">
                            <MapPin size={16} color="#111827" style={{ marginTop: 2 }} />
                            <View className="ml-3 flex-1">
                                <Text className="text-[11px] uppercase tracking-wider text-slate-400">
                                    Drop-off{order.address_label ? ` · ${order.address_label}` : ''}
                                </Text>
                                <Text className="text-sm font-semibold text-slate-900">{order.customer.name || 'Customer'}</Text>
                                {order.address ? <Text className="text-xs text-slate-500">{order.address}</Text> : null}
                            </View>
                        </View>
                    </View>

                    {/* Items */}
                    <Text className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Items</Text>
                    <View className="rounded-2xl border border-slate-100">
                        {order.items.map((it, i) => (
                            <View
                                key={`${it.title}-${i}`}
                                className={`flex-row items-center px-4 py-3 ${i ? 'border-t border-slate-100' : ''}`}
                            >
                                <Text className="flex-1 text-sm text-slate-800" numberOfLines={1}>
                                    {it.quantity} × {it.title}
                                </Text>
                                <Text className="text-sm font-semibold text-slate-900">{money(it.price * it.quantity)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View className="mt-3 space-y-1.5 pb-2">
                        <Row label="Items" value={money(itemsTotal)} />
                        <Row label="Delivery fee" value={money(order.delivery_fee)} />
                        <View className="my-1 h-px bg-slate-100" />
                        <Row label={delivered ? 'Collected from customer' : 'Order total'} value={money(order.total_price)} bold />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <View className="flex-row justify-between py-0.5">
            <Text className={`text-sm ${bold ? 'font-bold text-slate-950' : 'text-slate-500'}`}>{label}</Text>
            <Text className={`text-sm ${bold ? 'font-bold text-slate-950' : 'text-slate-700'}`}>{value}</Text>
        </View>
    );
}
