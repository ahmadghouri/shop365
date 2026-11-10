import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
    ChevronLeft,
    LocateFixed,
    MapPin,
    Navigation,
    Phone,
    Store,
    Wallet,
} from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { DestinationPin } from '@/components/map/DestinationPin';
import { RiderPin } from '@/components/map/RiderPin';
import { StatusBadge } from '@/components/reusable/StatusBadge';
import type { RiderOrder } from '@/lib/riderOrders';
import { useLiveLocation, type LatLng } from '@/lib/useLiveLocation';
import { distanceMeters, fetchRoadRoute, pathLength, remainingRoute, snapToRoute } from '@/lib/route';

const ACCENT = '#EAB308';
const DARK = '#111827';
const AVG_SPEED_MPS = 25_000 / 3600; // ~25 km/h in city traffic
const REROUTE_AFTER_M = 150; // fetch a new route if the rider leaves it by this much
const SNAP_WITHIN_M = 60; // GPS this close to the route is drawn on the road

// The delivery map is always dark: Google "night" style with readable roads
// and labels, POI icons hidden.
const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#1d2129' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8a94a6' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2129' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a4150' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#232833' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1b2a24' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2f3542' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d2129' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#a3acbd' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#454d5d' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#d0d5de' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#262b35' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1724' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b5b73' }] },
];

type Props = {
    order: RiderOrder;
    busy: boolean;
    onBack: () => void;
    /** Ask the parent to mark the order delivered (it confirms + updates). */
    onMarkDelivered: () => void;
    /** Open the cancel-delivery sheet (rider gives a reason). */
    onCancelDelivery: () => void;
};

function money(n: number) {
    return `Rs ${Number(n || 0).toLocaleString()}`;
}

function formatDistance(m: number) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.max(0, Math.round(m))} m`;
}

const hasCoords = (p?: { latitude: number | null; longitude: number | null } | null): p is LatLng =>
    !!p && typeof p.latitude === 'number' && typeof p.longitude === 'number';

/**
 * In-app delivery map: rider's live position, the customer's drop-off pin and
 * the road route between them, with the delivery details in a bottom sheet.
 * While open it also reports the rider's GPS to the backend.
 */
export function DeliveryMapPage({ order, busy, onBack, onMarkDelivered, onCancelDelivery }: Props) {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const { position, permissionDenied } = useLiveLocation(true);

    const destination = hasCoords(order.dropoff) ? { latitude: order.dropoff.latitude, longitude: order.dropoff.longitude } : null;
    const pickup = hasCoords(order.pickup) ? { latitude: order.pickup.latitude, longitude: order.pickup.longitude } : null;

    const [route, setRoute] = useState<LatLng[]>([]);
    const [sheetHeight, setSheetHeight] = useState(0);
    const routing = useRef(false);
    const framed = useRef(false);

    // Fetch a road route once we know where the rider is, and again whenever
    // they wander off it.
    useEffect(() => {
        if (!position || !destination || routing.current) return;
        const offRoute =
            route.length === 0 ||
            (route.length > 1 && snapToRoute(route, position).distance > REROUTE_AFTER_M);
        if (!offRoute) return;

        routing.current = true;
        fetchRoadRoute(position, destination)
            .then((road) => setRoute(road ?? [position, destination]))
            .finally(() => {
                routing.current = false;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position?.latitude, position?.longitude, destination?.latitude, destination?.longitude]);

    // Raw GPS drifts off the road; when close to the route, draw the rider on it.
    const snap = useMemo(
        () => (position && route.length > 1 ? snapToRoute(route, position) : null),
        [route, position]
    );
    const onRoad = !!snap && snap.distance <= SNAP_WITHIN_M;
    const shownPosition = onRoad ? snap!.point : position;
    const ahead = useMemo(() => {
        if (!position || !route.length) return [];
        const rest = remainingRoute(route, position);
        return onRoad ? rest : [position, ...rest];
    }, [route, position, onRoad]);
    const metersLeft = ahead.length > 1 ? pathLength(ahead) : position && destination ? distanceMeters(position, destination) : null;
    const minutesLeft = metersLeft != null ? Math.max(1, Math.round(metersLeft / AVG_SPEED_MPS / 60)) : null;

    const fitAll = () => {
        const points = [position, destination, pickup].filter(Boolean) as LatLng[];
        if (points.length >= 2) {
            mapRef.current?.fitToCoordinates(points, {
                edgePadding: { top: 120, right: 60, bottom: 60, left: 60 },
                animated: true,
            });
        } else if (points.length === 1) {
            mapRef.current?.animateToRegion({ ...points[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, 400);
        }
    };

    // Frame rider + destination the first time we have the rider's position.
    useEffect(() => {
        if (position && !framed.current) {
            framed.current = true;
            setTimeout(fitAll, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    const openExternalNavigation = () => {
        const dest = destination
            ? `${destination.latitude},${destination.longitude}`
            : encodeURIComponent(order.dropoff?.address || order.user?.address || '');
        if (!dest) return;
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=two-wheeler`);
    };

    const initialCenter = destination || pickup || position || { latitude: 33.6844, longitude: 73.0479 };
    const address = order.dropoff?.address || order.user?.address || '';
    const canDeliver = order.status === 'out_for_delivery';

    return (
        <View className="flex-1 bg-slate-100">
            <MapView
                ref={mapRef}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={{ flex: 1 }}
                initialRegion={{ ...initialCenter, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
                mapPadding={{ top: insets.top + 60, bottom: sheetHeight, left: 0, right: 0 }}
                customMapStyle={DARK_MAP_STYLE}
                userInterfaceStyle="dark"
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
            >
                {/* Route ahead: dark outline + yellow line (same style as the customer app) */}
                {ahead.length > 1 ? (
                    <>
                        <Polyline coordinates={ahead} strokeColor="#f8fafc" strokeWidth={9} lineCap="round" lineJoin="round" zIndex={1} />
                        <Polyline coordinates={ahead} strokeColor={ACCENT} strokeWidth={5} lineCap="round" lineJoin="round" zIndex={2} />
                    </>
                ) : null}

                {pickup ? (
                    <Marker coordinate={pickup} title={order.pickup?.name || 'Pickup'} anchor={{ x: 0.5, y: 0.5 }}>
                        <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-[#EAB308] bg-slate-900" style={{ elevation: 4 }}>
                            <Store size={16} color="#EAB308" />
                        </View>
                    </Marker>
                ) : null}

                {destination ? (
                    <Marker coordinate={destination} title={order.user?.name || 'Customer'} anchor={{ x: 0.5, y: 1 }} zIndex={5}>
                        <DestinationPin />
                    </Marker>
                ) : null}

                {shownPosition ? (
                    <Marker coordinate={shownPosition} title="You" anchor={{ x: 0.5, y: 0.5 }} zIndex={10}>
                        <RiderPin />
                    </Marker>
                ) : null}
            </MapView>

            {/* Top bar */}
            <View className="absolute left-4 right-4 flex-row items-center justify-between" style={{ top: insets.top + 8 }}>
                <Pressable
                    onPress={onBack}
                    className="flex-row items-center rounded-full bg-slate-900 px-4 py-2.5 active:opacity-80"
                    style={{ elevation: 5, shadowColor: '#0f172a', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
                >
                    <ChevronLeft size={18} color="#f8fafc" />
                    <Text className="ml-1 text-sm font-semibold text-slate-50">Back</Text>
                </Pressable>
                <Pressable
                    onPress={fitAll}
                    className="h-11 w-11 items-center justify-center rounded-full bg-slate-900 active:opacity-80"
                    style={{ elevation: 5, shadowColor: '#0f172a', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
                >
                    <LocateFixed size={20} color="#EAB308" />
                </Pressable>
            </View>

            {/* Status chips */}
            <View className="absolute left-0 right-0 items-center" style={{ top: insets.top + 64 }} pointerEvents="none">
                {permissionDenied ? (
                    <View className="rounded-full bg-red-500 px-4 py-2">
                        <Text className="text-xs font-semibold text-white">Allow location access to show your position</Text>
                    </View>
                ) : !position ? (
                    <View className="flex-row items-center rounded-full bg-slate-900 px-4 py-2" style={{ elevation: 3 }}>
                        <ActivityIndicator size="small" color="#EAB308" />
                        <Text className="ml-2 text-xs font-semibold text-slate-200">Finding your location…</Text>
                    </View>
                ) : !destination ? (
                    <View className="rounded-full bg-slate-950 px-4 py-2">
                        <Text className="text-xs font-semibold text-white">Customer pin not available — use the address below</Text>
                    </View>
                ) : null}
            </View>

            {/* Bottom sheet */}
            <View
                onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
                className="absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-white px-5 pt-3"
                style={{
                    paddingBottom: insets.bottom + 16,
                    elevation: 12,
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: -4 },
                }}
            >
                <View className="mb-3 items-center">
                    <View className="h-1.5 w-12 rounded-full bg-slate-200" />
                </View>

                {/* Distance / ETA */}
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-slate-950">
                            {minutesLeft != null ? `${minutesLeft} min` : '—'}
                        </Text>
                        <Text className="text-sm text-slate-500">
                            {metersLeft != null ? `${formatDistance(metersLeft)} to customer` : 'Calculating distance…'}
                        </Text>
                    </View>
                    <StatusBadge status={order.status} />
                </View>

                {/* Drop-off */}
                <View className="mt-4 flex-row items-center rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                        <MapPin size={18} color="#b77900" />
                    </View>
                    <View className="ml-3 flex-1 min-w-0">
                        <Text className="text-xs text-slate-400">
                            Deliver to{order.dropoff?.label ? ` · ${order.dropoff.label}` : ''}
                        </Text>
                        <Text className="text-sm font-bold text-slate-950" numberOfLines={1}>
                            {order.user?.name || 'Customer'}
                        </Text>
                        {address ? (
                            <Text className="text-xs text-slate-500" numberOfLines={2}>
                                {address}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Cash to collect */}
                <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                    <View className="flex-row items-center">
                        <Wallet size={16} color="#b77900" />
                        <Text className="ml-2 text-sm text-slate-700">Collect from customer</Text>
                    </View>
                    <Text className="text-base font-bold text-slate-950">{money(order.total_price)}</Text>
                </View>

                {/* Actions */}
                <View className="mt-4 flex-row items-center gap-2">
                    {order.user?.phone_no ? (
                        <Pressable
                            onPress={() => Linking.openURL(`tel:${order.user.phone_no}`)}
                            className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70"
                        >
                            <Phone size={18} color="#b77900" />
                        </Pressable>
                    ) : null}
                    <Pressable
                        onPress={openExternalNavigation}
                        className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70"
                    >
                        <Navigation size={18} color="#b77900" />
                    </Pressable>
                    {canDeliver ? (
                        <Pressable className="flex-1 active:opacity-80" disabled={busy} onPress={onMarkDelivered}>
                            <GradientPill className="h-12 rounded-full">
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-sm font-bold text-slate-950">
                                        {busy ? 'Please wait…' : 'Mark Delivered'}
                                    </Text>
                                </View>
                            </GradientPill>
                        </Pressable>
                    ) : null}
                </View>

                <Pressable onPress={onCancelDelivery} disabled={busy} className="mt-3 items-center py-1 active:opacity-60">
                    <Text className="text-sm font-semibold text-red-600">Cancel delivery</Text>
                </Pressable>
            </View>
        </View>
    );
}
