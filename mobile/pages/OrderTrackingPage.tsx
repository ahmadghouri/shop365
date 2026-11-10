import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
    Animated,
    PanResponder,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike, MapPin } from 'lucide-react-native';
import { useOrderDetail } from '@/api/orders/useOrderQueries';
import type { Order, OrderDetail } from '@/api/orders/order.service';
import { statusToStep } from '@/components/orders/OrderTimeline';
import { TrackingMap } from '@/components/orders/tracking/TrackingMap';
import { useLiveRider } from '@/components/orders/tracking/useLiveRider';
import { TrackingStepper } from '@/components/orders/tracking/TrackingStepper';
import { CourierCard } from '@/components/orders/tracking/CourierCard';
import { TrackingBackButton } from '@/components/orders/tracking/TrackingBackButton';
import { ReviewPrompt } from '@/components/orders/tracking/ReviewPrompt';
import { useOrderReview } from '@/components/orders/tracking/useOrderReview';
import { ReviewModal } from '@/components/orders/ReviewModal';
import { formatTime, timelineStepToStage } from '@/components/orders/tracking/trackingConstants';

type Props = {
    orderId: string;
    initialOrder?: Order;
    onBack?: () => void;
};

export function OrderTrackingPage({ orderId, initialOrder, onBack }: Props) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isTinyScreen = width < 340;
    const sheetPx = isTinyScreen ? 'px-4' : 'px-6';
    const { data: detail, refetch: refetchDetail } = useOrderDetail(orderId);
    // Prefer the freshly fetched detail: it carries the ETA and populated
    // courier that the list payload in `initialOrder` may not have yet.
    const order = (detail as Order | undefined) ?? initialOrder;

    // Post-delivery review flow (vendor + rider), backed by server flags.
    const review = useOrderReview(order, detail as OrderDetail | undefined);

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
    const destination = order?.delivery_address;
    const destinationText =
        destination?.address ||
        [destination?.street, destination?.area, destination?.city].filter(Boolean).join(', ');
    const destinationCoord = useMemo(
        () =>
            typeof destination?.latitude === 'number' && typeof destination?.longitude === 'number'
                ? { latitude: destination.latitude, longitude: destination.longitude }
                : null,
        [destination?.latitude, destination?.longitude],
    );

    // Live rider: shown only after the rider taps "Start Delivery"
    // (status "out_for_delivery"), then follows live socket updates.
    const liveRider = useLiveRider(
        orderId,
        status === 'out_for_delivery',
        order?.rider?.location,
        destinationCoord,
    );
    const riderOnTheWay =
        !delivered && !cancelled && (status === 'out_for_delivery' || liveRider.gotLive);

    // First live point arrived before the screen saw the new status → refresh
    // so the stepper and ETA catch up.
    useEffect(() => {
        if (liveRider.gotLive && status !== 'out_for_delivery' && !delivered && !cancelled) {
            refetchDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveRider.gotLive]);
    const riderDistanceLabel =
        liveRider.remainingMeters == null
            ? ''
            : liveRider.remainingMeters >= 1000
                ? `${(liveRider.remainingMeters / 1000).toFixed(1)} km`
                : `${Math.round(liveRider.remainingMeters)} m`;
    const lastSeenMinutes = liveRider.updatedAt
        ? Math.floor((Date.now() - liveRider.updatedAt.getTime()) / 60000)
        : null;

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
        <View className="flex-1 bg-slate-100">
            {/* Full-screen Google map pinned on the delivery address. The
                padding keeps the pin clear of the back button and the sheet. */}
            <View className="absolute inset-0">
                <TrackingMap
                    latitude={destination?.latitude}
                    longitude={destination?.longitude}
                    title={destination?.label || ''}
                    topInset={insets.top + 56}
                    bottomInset={sheetHeight}
                    riderPosition={liveRider.position}
                    remainingRoute={liveRider.remainingRoute}
                    fullRoute={liveRider.fullRoute}
                />
            </View>

            {/* Back button */}
            <TrackingBackButton onBack={onBack} />

            {/* Live rider chip (top right) */}
            {riderOnTheWay ? (
                <View
                    pointerEvents="none"
                    className="absolute right-4 items-end"
                    style={{ top: insets.top + 8 }}
                >
                    <View
                        className="flex-row items-center rounded-full bg-white px-4 py-2.5"
                        style={{
                            shadowColor: '#0f172a',
                            shadowOpacity: 0.12,
                            shadowRadius: 10,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 5,
                        }}
                    >
                        <View
                            className={`h-2 w-2 rounded-full ${liveRider.position && (lastSeenMinutes ?? 0) < 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        />
                        <Text className="ml-2 text-sm font-lufga-semibold text-slate-950">
                            {!liveRider.position
                                ? 'Waiting for rider location'
                                : (lastSeenMinutes ?? 0) >= 2
                                    ? `Last seen ${lastSeenMinutes} min ago`
                                    : 'Live'}
                        </Text>
                    </View>

                    {liveRider.position && riderDistanceLabel ? (
                        <View className="mt-2 flex-row items-center rounded-full bg-slate-950 px-3 py-1.5">
                            <Bike size={14} color="#EAB308" />
                            <Text className="ml-1.5 text-xs font-lufga-semibold text-white">
                                {liveRider.remainingMeters != null && liveRider.remainingMeters < 50
                                    ? 'Rider has arrived'
                                    : `Rider ${riderDistanceLabel} away`}
                            </Text>
                        </View>
                    ) : null}
                </View>
            ) : null}

            {/* Bottom sheet — overlays the map at the bottom and slides away on drag */}
            <Animated.View
                onLayout={onSheetLayout}
                className={`absolute left-0 right-0 bottom-0 rounded-t-[32px] bg-white ${sheetPx} pt-3`}
                style={{
                    transform: [{ translateY }],
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: -4 },
                    elevation: 12,
                }}
            >

                {/* Drag handle — swipe down to collapse (reveal the map),
                    swipe up to expand. The page is not dismissed by dragging. */}
                <View {...panResponder.panHandlers} className="items-center pb-3 pt-1">
                    <View className="h-1.5 w-12 rounded-full bg-slate-200" />
                </View>

                <SafeAreaView edges={['bottom']}>
                    {/* Top section — stays visible when collapsed: ETA + stepper */}
                    <View onLayout={onTopSectionLayout}>
                        <Text className="text-center text-base font-lufga-bold text-slate-950">
                            {etaLabel}
                        </Text>
                        <Text className="mt-1 text-center text-[13px] font-lufga text-slate-500">
                            {subLabel}
                        </Text>

                        <TrackingStepper currentStage={currentStage} cancelled={cancelled} />
                    </View>

                    <Text className="mt-3 text-center text-[11px] font-lufga text-slate-400">
                        Order #{shortId}
                    </Text>

                    {destinationText ? (
                        <View className="mt-4 flex-row items-center rounded-3xl border border-slate-100 bg-slate-50 p-4">
                            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                                <MapPin size={18} color="#b77900" />
                            </View>
                            <View className="ml-3 flex-1 min-w-0">
                                <Text className="text-xs font-lufga text-slate-400">
                                    Delivering to{destination?.label ? ` · ${destination.label}` : ''}
                                </Text>
                                <Text className="mt-0.5 font-lufga-semibold text-slate-950" numberOfLines={2}>
                                    {destinationText}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    <CourierCard
                        partnerName={partnerName}
                        riderPhone={riderPhone}
                        riderImage={riderImage}
                    />

                    {/* Rate your order — shown once delivered, only if not yet reviewed */}
                    {review.delivered ? (
                        <ReviewPrompt
                            canReview={review.canReview}
                            alreadyReviewed={review.alreadyReviewed}
                            onPress={review.openReview}
                        />
                    ) : null}
                </SafeAreaView>
            </Animated.View>

            {review.canReview ? (
                <ReviewModal
                    visible={review.showReview}
                    orderId={orderId}
                    businessId={review.needVendorReview ? review.businessId : null}
                    riderName={order?.rider?.name}
                    riderImage={order?.rider?.image}
                    hasRider={review.needRiderReview}
                    onClose={review.closeReview}
                    onSubmitted={review.markReviewed}
                />
            ) : null}
        </View>
    );
}
