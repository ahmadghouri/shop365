import { useMemo } from 'react';
import { Image, Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
    Bike,
    Check,
    ChevronLeft,
    CookingPot,
    MessageCircle,
    Phone,
    ReceiptText,
} from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';
import type { Order } from '@/api/orders/order.service';
import { statusToStep } from '@/components/orders/OrderTimeline';

type Props = {
    orderId: string;
    initialOrder?: Order;
    onBack?: () => void;
};

const LIME = '#C6F542';

// A row of small dots between two stepper icons. Reached segments are lime,
// the rest are muted grey, matching the design.
function DottedConnector({ active }: { active: boolean }) {
    return (
        <View className="mx-1.5 flex-1 flex-row items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
                <View
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: active ? LIME : '#4A4A4A' }}
                />
            ))}
        </View>
    );
}

// The bottom-sheet stepper is a condensed 4-stage view of the full timeline.
const STAGES = [
    { key: 'placed', label: 'Order placed', Icon: ReceiptText },
    { key: 'preparing', label: 'Preparing', Icon: CookingPot },
    { key: 'on_the_way', label: 'On the way', Icon: Bike },
    { key: 'delivered', label: 'Delivered', Icon: Check },
];

// Map the detailed timeline step (0..6) onto the 4 condensed stages.
function timelineStepToStage(step: number): number {
    if (step >= 6) return 3; // delivered
    if (step >= 3) return 2; // picked up / out for delivery
    if (step >= 2) return 1; // preparing
    return 0; // placed / confirmed
}

function MapBackdrop({ width, height }: { width: number; height: number }) {
    // A stylised map surface: soft base, a few "blocks" and roads, a dashed
    // delivery route from the courier (yellow) to the destination (dark pin).
    const startX = width * 0.24;
    const startY = height * 0.82;
    const endX = width * 0.72;
    const endY = height * 0.2;

    const route = `M ${startX} ${startY}
        C ${startX} ${startY - 70}, ${width * 0.5} ${height * 0.72}, ${width * 0.42} ${height * 0.56}
        S ${width * 0.34} ${height * 0.42}, ${width * 0.52} ${height * 0.36}
        S ${endX} ${height * 0.34}, ${endX} ${endY}`;

    return (
        <Svg width={width} height={height}>
            <Rect x={0} y={0} width={width} height={height} fill="#E9EDE9" />

            {/* Faint street grid */}
            {[0.18, 0.4, 0.62, 0.84].map((f) => (
                <Rect
                    key={`h${f}`}
                    x={0}
                    y={height * f}
                    width={width}
                    height={6}
                    fill="#F4F6F3"
                />
            ))}
            {[0.2, 0.46, 0.72].map((f) => (
                <Rect
                    key={`v${f}`}
                    x={width * f}
                    y={0}
                    width={6}
                    height={height}
                    fill="#F4F6F3"
                />
            ))}

            {/* A couple of park / block accents */}
            <Rect
                x={width * 0.06}
                y={height * 0.24}
                width={width * 0.24}
                height={height * 0.12}
                rx={10}
                fill="#DDE6DB"
            />
            <Rect
                x={width * 0.56}
                y={height * 0.6}
                width={width * 0.3}
                height={height * 0.16}
                rx={10}
                fill="#DDE6DB"
            />

            {/* Delivery route */}
            <Path
                d={route}
                stroke="#1A1A1A"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1 12"
            />

            {/* Start (courier) marker */}
            <Circle cx={startX} cy={startY} r={12} fill="#EAB308" opacity={0.25} />
            <Circle cx={startX} cy={startY} r={7} fill="#EAB308" stroke="#fff" strokeWidth={2} />

            {/* Destination marker */}
            <Circle cx={endX} cy={endY} r={16} fill="#1A1A1A" />
            <Circle cx={endX} cy={endY} r={5} fill="#fff" />
        </Svg>
    );
}

function formatTime(value?: string | null) {
    if (!value) return '';
    const at = new Date(value);
    if (Number.isNaN(at.getTime())) return '';
    return at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderTrackingPage({ orderId, initialOrder, onBack }: Props) {
    const { width, height } = useWindowDimensions();
    const { data: detail } = useOrderDetail(orderId);
    // Prefer the freshly fetched detail: it carries the ETA and populated
    // courier that the list payload in `initialOrder` may not have yet.
    const order = (detail as Order | undefined) ?? initialOrder;

    const status = order?.status ?? 'pending';
    const cancelled = status === 'cancelled';
    const timelineStep = statusToStep(status);
    const currentStage = timelineStepToStage(timelineStep);
    const delivered = status === 'delivered';

    const shortId = orderId.slice(-6).toUpperCase();

    // ETA comes from the backend (`estimated_delivery_at`), with the actual
    // delivery time shown once the order has landed.
    const etaLabel = useMemo(() => {
        if (delivered) {
            const at = formatTime(order?.delivered_at);
            return at ? `Delivered at ${at}` : 'Delivered';
        }
        if (cancelled) return 'Order cancelled';
        const at = formatTime(order?.estimated_delivery_at);
        return at ? `Estimated delivery time is ${at}` : 'Estimating delivery time…';
    }, [delivered, cancelled, order?.delivered_at, order?.estimated_delivery_at]);

    const subLabel = delivered
        ? 'Your order has been delivered.'
        : cancelled
            ? 'This order was cancelled.'
            : currentStage >= 2
                ? 'Your order is already on its way to you!'
                : 'Your order is being prepared.';

    const partnerName = order?.rider?.name || order?.vendors?.[0] || 'Delivery partner';
    const riderPhone = order?.rider?.phone_no;
    const riderImage = order?.rider?.image;

    const mapHeight = Math.max(height * 0.62, 360);

    return (
        <View className="flex-1 bg-[#111111]">
            {/* Map */}
            <View style={{ height: mapHeight }} className="w-full">
                <MapBackdrop width={width} height={mapHeight} />

                <SafeAreaView
                    edges={['top', 'left']}
                    className="absolute left-0 top-0"
                    pointerEvents="box-none"
                >
                    <Pressable
                        className="ml-4 mt-2 flex-row items-center rounded-full bg-[#141414] px-4 py-2.5 active:opacity-80"
                        style={{
                            shadowColor: '#000',
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 5,
                        }}
                        onPress={onBack}
                    >
                        <ChevronLeft size={18} color="#fff" />
                        <Text className="ml-1 text-sm font-lufga-semibold text-white">Back</Text>
                    </Pressable>
                </SafeAreaView>
            </View>

            {/* Bottom sheet */}
            <View
                className="flex-1 rounded-t-[32px] bg-[#141414] px-6 pt-6"
                style={{ marginTop: -32 }}
            >
                <SafeAreaView edges={['bottom']} className="flex-1">
                    {/* ETA */}
                    <Text className="text-center text-base font-lufga-bold text-white">
                        {etaLabel}
                    </Text>
                    <Text className="mt-1 text-center text-[13px] font-lufga text-slate-400">
                        {subLabel}
                    </Text>

                    {/* Stepper */}
                    <View className="mt-6 border-t border-b border-white/10 py-6">
                        <View className="flex-row items-center justify-between">
                            {STAGES.map((stage, index) => {
                                const done = !cancelled && index < currentStage;
                                const active = !cancelled && index === currentStage;
                                const reached = done || active;
                                const StageIcon = stage.Icon;
                                const isLast = index === STAGES.length - 1;
                                const finalStage = isLast;

                                return (
                                    <View
                                        key={stage.key}
                                        className={`flex-row items-center ${isLast ? '' : 'flex-1'}`}
                                    >
                                        {finalStage ? (
                                            // Delivered node: filled circle with a check
                                            <View
                                                className={`h-10 w-10 items-center justify-center rounded-full ${reached ? 'bg-[#C6F542]' : 'bg-[#3A3A3A]'}`}
                                            >
                                                <Check
                                                    size={18}
                                                    color={reached ? '#141414' : '#8A8A8A'}
                                                    strokeWidth={3}
                                                />
                                            </View>
                                        ) : (
                                            <StageIcon
                                                size={30}
                                                color={reached ? LIME : '#6B7280'}
                                                strokeWidth={2}
                                            />
                                        )}
                                        {!isLast && (
                                            <DottedConnector active={done} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <Text className="mt-3 text-center text-[11px] font-lufga text-slate-500">
                        Order #{shortId}
                    </Text>

                    {/* Courier row */}
                    <View className="mt-auto mb-2 flex-row items-center rounded-3xl bg-[#1D1D1D] p-4">
                        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                            {riderImage ? (
                                <Image
                                    source={{ uri: riderImage }}
                                    className="h-12 w-12"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-xs font-lufga text-slate-300">Rider</Text>
                            )}
                        </View>

                        <View className="ml-3 flex-1 min-w-0">
                            <Text
                                className="text-sm font-lufga-bold text-white"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {partnerName}
                            </Text>
                            <Text className="text-xs font-lufga text-slate-400">Courier</Text>
                        </View>

                        {/* Call */}
                        <Pressable
                            className="h-12 w-12 items-center justify-center rounded-full bg-white active:opacity-70"
                            onPress={() =>
                                riderPhone ? Linking.openURL(`tel:${riderPhone}`) : undefined
                            }
                        >
                            <Phone size={19} color="#141414" />
                        </Pressable>

                        {/* Message */}
                        <Pressable className="relative ml-2 h-12 w-12 items-center justify-center rounded-full bg-white active:opacity-70">
                            <MessageCircle size={19} color="#141414" />
                            <View
                                className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-[#1D1D1D]"
                                style={{ backgroundColor: LIME }}
                            />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}
