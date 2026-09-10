import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft, MessageSquare, Phone } from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';

type OrderTrackingPageProps = {
    orderId: string;
    onBack?: () => void;
};

const STEPS = [
    { key: 'pending',          label: 'Order placed' },
    { key: 'confirmed',        label: 'Order confirmed' },
    { key: 'preparing',        label: 'Preparing your order' },
    { key: 'picked_up',        label: 'Picked up by rider' },
    { key: 'out_for_delivery', label: 'Out for delivery' },
    { key: 'delivered',        label: 'Delivered' },
];

const STATUS_TO_STEP: Record<string, number> = {
    pending:          0,
    confirmed:        1,
    preparing:        2,
    picked_up:        3,
    out_for_delivery: 4,
    delivered:        5,
    cancelled:        -1,
};

const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    picked_up: 'Picked up',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

function Timeline({ status, statusHistory }: { status: string; statusHistory?: { status: string; at: string }[] }) {
    const activeIdx = STATUS_TO_STEP[status] ?? 0;
    const historyMap: Record<string, string> = {};
    (statusHistory ?? []).forEach(h => { historyMap[h.status] = h.at; });

    // Debug: log to verify
    console.log('[Timeline] status:', status, 'activeIdx:', activeIdx);

    return (
        <View style={{ paddingHorizontal: 28, paddingTop: 16 }}>
            {STEPS.map((step, i) => {
                const isDone = i < activeIdx;
                const isActive = i === activeIdx;
                const isLast = i === STEPS.length - 1;

                return (
                    <View key={step.key} style={{ flexDirection: 'row' }}>
                        {/* Icon + line */}
                        <View style={{ alignItems: 'center', width: 28, marginRight: 20 }}>
                            {isDone ? (
                                <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: '#1e1e2e',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Check size={16} color="#EAB308" strokeWidth={3} />
                                </View>
                            ) : isActive ? (
                                <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    borderWidth: 3, borderColor: '#EAB308',
                                    backgroundColor: '#fff',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308' }} />
                                </View>
                            ) : (
                                <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: '#f1f5f9',
                                    borderWidth: 2, borderColor: '#e2e8f0',
                                }} />
                            )}
                            {!isLast && (
                                <View style={{
                                    width: 2, minHeight: 36, flex: 1,
                                    backgroundColor: isDone ? '#1e1e2e' : '#e2e8f0',
                                    marginTop: 2, marginBottom: 2,
                                }} />
                            )}
                        </View>

                        {/* Text */}
                        <View style={{ flex: 1, paddingBottom: 28 }}>
                            <Text style={{
                                fontSize: 15,
                                fontFamily: (isDone || isActive) ? 'Lufga-SemiBold' : 'Lufga',
                                color: (isDone || isActive) ? '#0f172a' : '#94a3b8',
                                marginTop: 4,
                            }}>
                                {step.label}
                            </Text>
                            {(isDone || isActive) && historyMap[step.key] && (
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Lufga', marginTop: 2 }}>
                                    {formatTime(historyMap[step.key])}
                                </Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

export function OrderTrackingPage({ orderId, onBack }: OrderTrackingPageProps) {
    const { data: order, isLoading } = useOrderDetail(orderId);
    const insets = useSafeAreaInsets();
    const shortId = orderId.slice(-6).toUpperCase();
    const status = order?.status ?? 'pending';
    const statusLabel = STATUS_LABEL[status] ?? status;

    return (
        <View style={{ flex: 1, backgroundColor: '#dde5d8' }}>

            {/* ── Map placeholder ── */}
            <View style={{ height: 240, alignItems: 'center', justifyContent: 'center' }}>
                {/* small image placeholder icon */}
                <View style={{ position: 'relative', marginBottom: 8 }}>
                    <View style={{
                        width: 48, height: 48, borderRadius: 10,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
                    }}>
                        {/* image icon using simple shapes */}
                        <View style={{ width: 24, height: 20, borderRadius: 3, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db', position: 'absolute', top: 2, left: 3 }} />
                            <View style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0, height: 9,
                                borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
                                backgroundColor: '#e5e7eb',
                            }} />
                        </View>
                    </View>
                    {/* amber dot */}
                    <View style={{
                        position: 'absolute', top: -5, right: -5,
                        width: 14, height: 14, borderRadius: 7,
                        backgroundColor: '#EAB308',
                        borderWidth: 2, borderColor: '#dde5d8',
                    }} />
                </View>
                <Text style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Lufga' }}>Drop live map</Text>
                {/* location dot */}
                <View style={{
                    position: 'absolute', bottom: 44, right: 88,
                    width: 9, height: 9, borderRadius: 5,
                    backgroundColor: '#1e293b',
                }} />
            </View>

            {/* Back button — absolutely over map */}
            <View style={{
                position: 'absolute',
                top: insets.top + 8,
                left: 16,
            }}>
                <Pressable
                    style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: '#fff',
                        alignItems: 'center', justifyContent: 'center',
                        shadowColor: '#000', shadowOpacity: 0.12,
                        shadowRadius: 8, elevation: 4,
                    }}
                    onPress={onBack}
                >
                    <ChevronLeft size={22} color="#171717" />
                </Pressable>
            </View>

            {/* ── White bottom sheet ── */}
            <View style={{
                flex: 1, backgroundColor: '#fff',
                borderTopLeftRadius: 28, borderTopRightRadius: 28,
                marginTop: -20,
            }}>
                {isLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                ) : order ? (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

                        {/* Status header */}
                        <View style={{
                            paddingHorizontal: 24, paddingTop: 24, paddingBottom: 4,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Lufga' }}>Arriving in</Text>
                                    <Text style={{ fontSize: 30, fontFamily: 'Lufga-Bold', color: '#0f172a', marginTop: 2 }}>
                                        {statusLabel}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Lufga', marginTop: 4 }}>
                                        Order #{shortId}
                                    </Text>
                                </View>
                                <View style={{
                                    marginTop: 4,
                                    paddingHorizontal: 14, paddingVertical: 6,
                                    borderRadius: 20,
                                    borderWidth: 1.5, borderColor: '#22c55e',
                                }}>
                                    <Text style={{ fontSize: 13, fontFamily: 'Lufga-SemiBold', color: '#22c55e' }}>
                                        {statusLabel}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Rider row */}
                        <View style={{
                            marginHorizontal: 24, marginTop: 20, marginBottom: 8,
                            flexDirection: 'row', alignItems: 'center',
                        }}>
                            {/* Avatar */}
                            <View style={{
                                width: 52, height: 52, borderRadius: 26,
                                backgroundColor: '#e2e8f0',
                                alignItems: 'center', justifyContent: 'center',
                                marginRight: 12,
                                borderWidth: 1.5, borderColor: '#cbd5e1',
                            }}>
                                <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 14, height: 10, borderRadius: 2, borderWidth: 2, borderColor: '#fff' }} />
                                    <View style={{ width: 8, height: 5, borderTopLeftRadius: 1, borderTopRightRadius: 1, backgroundColor: '#fff', marginTop: -1 }} />
                                </View>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Lufga-SemiBold', color: '#0f172a' }}>
                                    Shop365 Rider
                                </Text>
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Lufga', marginTop: 2 }}>
                                    Your delivery partner
                                </Text>
                            </View>

                            {/* Call */}
                            <Pressable style={{
                                width: 44, height: 44, borderRadius: 22,
                                backgroundColor: '#1e293b',
                                alignItems: 'center', justifyContent: 'center',
                                marginRight: 10,
                            }}>
                                <Phone size={18} color="#EAB308" />
                            </Pressable>

                            {/* Message */}
                            <Pressable style={{
                                width: 44, height: 44, borderRadius: 22,
                                backgroundColor: '#EAB308',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <MessageSquare size={18} color="#fff" />
                            </Pressable>
                        </View>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 24, marginTop: 16 }} />

                        {/* Timeline */}
                        <Timeline status={order.status} statusHistory={order.status_history} />

                    </ScrollView>
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#94a3b8' }}>Order not found</Text>
                    </View>
                )}

                {/* Footer — bordered button */}
                <View style={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 16,
                    paddingTop: 12,
                    backgroundColor: '#fff',
                }}>
                    <Pressable style={{
                        borderWidth: 1.5, borderColor: '#e2e8f0',
                        borderRadius: 16, paddingVertical: 16,
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 16, fontFamily: 'Lufga-SemiBold', color: '#0f172a' }}>
                            Order support
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
