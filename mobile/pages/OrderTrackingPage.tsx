import { useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
    Animated,
    PanResponder,
    Pressable,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';
import type { Order } from '@/api/orders/order.service';
import { statusToStep } from '@/components/orders/OrderTimeline';
import { MapBackdrop } from '@/components/orders/tracking/MapBackdrop';
import { TrackingStepper } from '@/components/orders/tracking/TrackingStepper';
import { CourierCard } from '@/components/orders/tracking/CourierCard';
import { formatTime, timelineStepToStage } from '@/components/orders/tracking/trackingConstants';

type Props = {
    orderId: string;
    initialOrder?: Order;
    onBack?: () => void;
};

export function OrderTrackingPage({ orderId, initialOrder, onBack }: Props) {
    const { width, height } = useWindowDimensions();
    const isTinyScreen = width < 340;
    const sheetPx = isTinyScreen ? 'px-4' : 'px-6';
    const { data: detail } = useOrderDetail(orderId);
    // Prefer the freshly fetched detail: it carries the ETA and populated
    // courier that the list payload in `initialOrder` may not have yet.
    const order = (detail as Order | undefined) ?? initialOrder;

    const status = order?.status ?? 'pending';
    const cancelled = status === 'cancelled';
    const currentStage = timelineStepToStage(statusToStep(status));
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

    // Collapsible bottom sheet using the built-in PanResponder (no native
    // modules, so no rebuild needed). It snaps between two positions:
    //   - open (0): full sheet visible
    //   - collapsed: sheet slides down so that ONLY the ETA + status stepper
    //     stay visible; the Order # and courier row drop below the screen.
    //     It never dismisses the page — Back does that.
    // Both heights are measured so the collapsed peek matches the real content.
    const [sheetHeight, setSheetHeight] = useState(0);
    const [topSectionHeight, setTopSectionHeight] = useState(0);

    // How far to slide down when collapsed: hide everything below the ETA +
    // stepper block, keeping that block on screen.
    const collapsedOffset = Math.max(sheetHeight - topSectionHeight, 0);

    const translateY = useRef(new Animated.Value(0)).current;
    // Remember where the sheet currently rests so a drag starts from there.
    const restY = useRef(0);
    // The PanResponder is created once (its closures capture the first render's
    // values), so we mirror the latest collapse distance into a ref and read
    // that inside the responder to avoid a stale-closure bug.
    const collapsedRef = useRef(0);
    collapsedRef.current = collapsedOffset;

    const onSheetLayout = (e: LayoutChangeEvent) => setSheetHeight(e.nativeEvent.layout.height);
    const onTopSectionLayout = (e: LayoutChangeEvent) =>
        // Include the drag handle above it plus a little breathing room.
        setTopSectionHeight(e.nativeEvent.layout.height + 44);

    const snapTo = (to: number) => {
        restY.current = to;
        Animated.spring(translateY, { toValue: to, useNativeDriver: true, bounciness: 4 }).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_evt, gesture) =>
                Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
            onPanResponderMove: (_evt, gesture) => {
                const max = collapsedRef.current;
                // Follow the finger, clamped between open (0) and collapsed.
                translateY.setValue(Math.min(max, Math.max(0, restY.current + gesture.dy)));
            },
            onPanResponderRelease: (_evt, gesture) => {
                const max = collapsedRef.current;
                // Decide the nearest snap point using position + velocity.
                const fastFlick = Math.abs(gesture.vy) > 1.2;
                const current = restY.current + gesture.dy;
                let target: number;
                if (fastFlick) {
                    target = gesture.dy > 0 ? max : 0;
                } else {
                    target = current > max / 2 ? max : 0;
                }
                snapTo(target);
            },
        })
    ).current;

    return (
        <View className="flex-1 bg-[#111111]">
            {/* Full-screen map: fills the whole screen so that when the bottom
                sheet is dragged down, the map takes its place behind it. */}
            <View className="absolute inset-0">
                <MapBackdrop width={width} height={height} />
            </View>

            {/* Back button */}
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

            {/* Bottom sheet — overlays the map at the bottom and slides away on drag */}
            <Animated.View
                onLayout={onSheetLayout}
                className={`absolute left-0 right-0 bottom-0 overflow-hidden rounded-t-[32px] ${sheetPx} pt-3`}
                style={{ transform: [{ translateY }] }}
            >
                {/* Gradient background fill (reusable GradientPill) */}
                <GradientPill
                    colors={['#1F2937', '#0B0B0B']}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />

                {/* Drag handle — swipe down to collapse (reveal the map),
                    swipe up to expand. The page is not dismissed by dragging. */}
                <View {...panResponder.panHandlers} className="items-center pb-3 pt-1">
                    <View className="h-1.5 w-12 rounded-full bg-white/25" />
                </View>

                <SafeAreaView edges={['bottom']}>
                    {/* Top section — stays visible when collapsed: ETA + stepper */}
                    <View onLayout={onTopSectionLayout}>
                        <Text className="text-center text-base font-lufga-bold text-white">
                            {etaLabel}
                        </Text>
                        <Text className="mt-1 text-center text-[13px] font-lufga text-slate-400">
                            {subLabel}
                        </Text>

                        <TrackingStepper currentStage={currentStage} cancelled={cancelled} />
                    </View>

                    <Text className="mt-3 text-center text-[11px] font-lufga text-slate-500">
                        Order #{shortId}
                    </Text>

                    <CourierCard
                        partnerName={partnerName}
                        riderPhone={riderPhone}
                        riderImage={riderImage}
                    />
                </SafeAreaView>
            </Animated.View>
        </View>
    );
}
