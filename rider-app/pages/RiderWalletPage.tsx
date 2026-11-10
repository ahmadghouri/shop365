import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ArrowDownLeft, Banknote, Bike, TrendingUp, Wallet, XCircle } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { BOTTOM_NAV_SPACE } from '@/components/reusable/BottomNav';
import { useRiderWallet } from '@/lib/riderOrders';

type Period = 'today' | 'week' | 'month' | 'total';

const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7 days' },
    { key: 'month', label: 'This month' },
    { key: 'total', label: 'All time' },
];

const money = (n: number) => `Rs ${Number(n || 0).toLocaleString()}`;

const CHART_HEIGHT = 110;

/** Rider wallet: earnings, cash collected from customers, 7-day chart, recent entries. */
export function RiderWalletPage() {
    const [period, setPeriod] = useState<Period>('week');
    const wallet = useRiderWallet();
    const w = wallet.data;

    const maxDay = useMemo(() => Math.max(1, ...(w?.daily ?? []).map((d) => d.earnings)), [w?.daily]);
    const weekdays = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short' }).slice(0, 2);

    if (wallet.isLoading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ paddingBottom: BOTTOM_NAV_SPACE }}>
                <ActivityIndicator size="large" color="#EAB308" />
            </View>
        );
    }

    if (wallet.isError || !w) {
        return (
            <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: BOTTOM_NAV_SPACE }}>
                <XCircle size={36} color="#dc2626" />
                <Text className="mt-3 text-base font-bold text-slate-900">Couldn&apos;t load your wallet</Text>
                <Pressable onPress={() => wallet.refetch()} className="mt-4 active:opacity-80">
                    <GradientPill className="rounded-full">
                        <Text className="px-6 py-2.5 font-semibold text-slate-950">Try again</Text>
                    </GradientPill>
                </Pressable>
            </View>
        );
    }

    const periodLabel = PERIODS.find((p) => p.key === period)!.label;

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: BOTTOM_NAV_SPACE }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={wallet.isRefetching}
                    onRefresh={() => {
                        wallet.refetch();
                    }}
                    tintColor="#EAB308"
                    colors={['#EAB308']}
                />
            }
        >
            <View className="px-5 pt-3">
                <Text className="text-2xl font-bold text-slate-950">Wallet</Text>
                <Text className="text-sm text-slate-500">Your earnings and cash</Text>
            </View>

            {/* Balance card */}
            <View className="mx-5 mt-4">
                <GradientPill className="rounded-[28px]">
                    <View className="p-5">
                        <View className="flex-row items-center">
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-950">
                                <Wallet size={18} color="#EAB308" />
                            </View>
                            <Text className="ml-2 text-sm font-semibold text-slate-800">Total earnings</Text>
                        </View>
                        <Text className="mt-3 text-4xl font-extrabold text-slate-950">{money(w.earnings.total)}</Text>
                        <Text className="mt-0.5 text-sm text-slate-800">
                            from {w.deliveries.total} deliver{w.deliveries.total === 1 ? 'y' : 'ies'}
                        </Text>
                        <View className="mt-4 flex-row gap-2">
                            <MiniStat label="Today" value={money(w.earnings.today)} />
                            <MiniStat label="7 days" value={money(w.earnings.week)} />
                            <MiniStat label="This month" value={money(w.earnings.month)} />
                        </View>
                    </View>
                </GradientPill>
            </View>

            {/* Period chips */}
            <View className="mx-5 mt-5 flex-row rounded-full bg-white/60 p-1">
                {PERIODS.map((p) => {
                    const on = period === p.key;
                    return (
                        <Pressable
                            key={p.key}
                            onPress={() => setPeriod(p.key)}
                            className={`flex-1 items-center rounded-full py-2 ${on ? 'bg-slate-950' : ''}`}
                        >
                            <Text className={`text-xs font-semibold ${on ? 'text-white' : 'text-slate-600'}`}>{p.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Earned / cash / deliveries for the chosen period */}
            <View className="mx-5 mt-3 flex-row gap-3">
                <Tile
                    icon={<TrendingUp size={17} color="#047857" />}
                    iconBg="bg-emerald-50"
                    label={`Earned · ${periodLabel}`}
                    value={money(w.earnings[period])}
                />
                <Tile
                    icon={<Bike size={17} color="#b77900" />}
                    iconBg="bg-amber-50"
                    label="Deliveries"
                    value={`${w.deliveries[period]}`}
                />
            </View>

            {/* Cash collected */}
            <GlassCard className="mx-5 mt-3 rounded-[24px]">
                <View className="flex-row items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-50">
                        <Banknote size={19} color="#0369a1" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-xs text-slate-500">Cash collected · {periodLabel}</Text>
                        <Text className="text-xl font-bold text-slate-950">{money(w.cash_collected[period])}</Text>
                    </View>
                </View>
                <Text className="mt-2 text-xs text-slate-500">
                    Cash you received from customers (cash on delivery). Hand it over as agreed with the
                    restaurant / office.
                </Text>
            </GlassCard>

            {/* 7-day chart */}
            <GlassCard className="mx-5 mt-3 rounded-[24px]">
                <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-slate-950">Last 7 days</Text>
                    <Text className="text-xs font-semibold text-emerald-600">{money(w.earnings.week)}</Text>
                </View>
                <View className="mt-4 flex-row items-end justify-between" style={{ height: CHART_HEIGHT + 34 }}>
                    {w.daily.map((d, i) => {
                        const h = d.earnings > 0 ? Math.max(6, (d.earnings / maxDay) * CHART_HEIGHT) : 4;
                        const isToday = i === w.daily.length - 1;
                        return (
                            <View key={d.date} className="flex-1 items-center">
                                <Text className="mb-1 text-[9px] text-slate-500" numberOfLines={1}>
                                    {d.earnings > 0 ? Number(d.earnings).toLocaleString() : ''}
                                </Text>
                                <View
                                    style={{ height: h, width: 18, borderRadius: 6 }}
                                    className={d.earnings > 0 ? (isToday ? 'bg-[#EAB308]' : 'bg-slate-900') : 'bg-slate-200'}
                                />
                                <Text className={`mt-1.5 text-[11px] ${isToday ? 'font-bold text-slate-950' : 'text-slate-500'}`}>
                                    {isToday ? 'Today' : weekdays(d.date)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </GlassCard>

            {/* Recent entries */}
            <Text className="mx-5 mb-2 mt-6 text-sm font-bold text-slate-900">Recent earnings</Text>
            {w.recent.length ? (
                w.recent.map((r) => (
                    <GlassCard key={r.order_id} className="mx-5 mb-2.5 flex-row items-center rounded-[22px] p-4">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                            <ArrowDownLeft size={18} color="#047857" />
                        </View>
                        <View className="ml-3 flex-1 min-w-0">
                            <Text className="text-sm font-semibold text-slate-950" numberOfLines={1}>
                                Delivery #{String(r.order_id).slice(-6).toUpperCase()}
                            </Text>
                            <Text className="text-xs text-slate-500" numberOfLines={1}>
                                {r.business_name ? `${r.business_name} · ` : ''}
                                {r.delivered_at
                                    ? new Date(r.delivered_at).toLocaleString([], {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                      })
                                    : ''}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-sm font-bold text-emerald-600">+{money(r.amount)}</Text>
                            <Text className="text-[11px] text-slate-400">cash {money(r.order_total)}</Text>
                        </View>
                    </GlassCard>
                ))
            ) : (
                <GlassCard className="mx-5 items-center rounded-[24px] py-8">
                    <Wallet size={28} color="#b77900" />
                    <Text className="mt-2 text-sm font-semibold text-slate-800">No earnings yet</Text>
                    <Text className="mt-0.5 text-xs text-slate-500">Complete a delivery to see it here.</Text>
                </GlassCard>
            )}
        </ScrollView>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-1 rounded-2xl bg-white/45 px-3 py-2">
            <Text className="text-[11px] text-slate-700">{label}</Text>
            <Text className="text-sm font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
        </View>
    );
}

function Tile({ icon, iconBg, label, value }: { icon: ReactNode; iconBg: string; label: string; value: string }) {
    return (
        <GlassCard className="flex-1 rounded-[24px] px-4 py-4">
            <View className={`h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>{icon}</View>
            <Text className="mt-2 text-lg font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                {label}
            </Text>
        </GlassCard>
    );
}
