import { useEffect, useMemo, useRef, useState } from 'react';
import type { LatLng } from 'react-native-maps';
import { onRiderLocation } from '@/lib/socketService';
import { curvedPath, fetchRoadRoute, pathLength, routeAhead, snapToRoute } from './route';

const REROUTE_AFTER_M = 150; // new road route once the rider leaves the old one by this much
const SNAP_WITHIN_M = 60; // GPS this close to the route is drawn on the road

type InitialLocation = { latitude: number | null; longitude: number | null; updated_at?: string | null } | null | undefined;

export type LiveRiderState = {
    position: LatLng | null;
    /** Route still to drive (rider → destination). */
    remainingRoute: LatLng[];
    /** Route as last fetched; used to frame the map when it changes. */
    fullRoute: LatLng[];
    remainingMeters: number | null;
    /** When the backend last heard from the rider. */
    updatedAt: Date | null;
    /**
     * A live `rider_location` arrived for this order. The backend only sends
     * these after the rider tapped "Start Delivery", so this means the delivery
     * has started even if the order status on screen hasn't refreshed yet.
     */
    gotLive: boolean;
};

const isPoint = (p: InitialLocation): p is { latitude: number; longitude: number; updated_at?: string | null } =>
    !!p && typeof p.latitude === 'number' && typeof p.longitude === 'number';

/**
 * Real rider position for an order, shown only once the delivery has started
 * ("Out for delivery"). Seeds from the last position in the order detail (the
 * backend only includes it after the delivery started), then follows live
 * `rider_location` socket events for this order.
 */
export function useLiveRider(
    orderId: string,
    deliveryStarted: boolean,
    initial: InitialLocation,
    destination: LatLng | null
): LiveRiderState {
    const [position, setPosition] = useState<LatLng | null>(null);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [gotLive, setGotLive] = useState(false);
    const [roadRoute, setRoadRoute] = useState<LatLng[] | null>(null);
    const routing = useRef(false);

    // Seed from the order detail once the delivery has started.
    useEffect(() => {
        if (!deliveryStarted || !isPoint(initial)) return;
        setPosition((cur) => cur ?? { latitude: initial.latitude, longitude: initial.longitude });
        setUpdatedAt((cur) => cur ?? (initial.updated_at ? new Date(initial.updated_at) : null));
    }, [deliveryStarted, initial?.latitude, initial?.longitude, initial?.updated_at]);

    // Always listen, so the very first live point (= delivery started) isn't missed.
    useEffect(() => {
        return onRiderLocation((e) => {
            if (e.order_id !== orderId) return;
            setGotLive(true);
            setPosition({ latitude: e.latitude, longitude: e.longitude });
            setUpdatedAt(e.updated_at ? new Date(e.updated_at) : new Date());
        });
    }, [orderId]);

    const visible = deliveryStarted || gotLive;

    // Road route; refetched when the rider strays from it.
    useEffect(() => {
        if (!visible || !position || !destination || routing.current) return;
        const offRoute =
            !roadRoute ||
            (roadRoute.length > 1 && snapToRoute(roadRoute, position).distance > REROUTE_AFTER_M);
        if (!offRoute) return;
        routing.current = true;
        fetchRoadRoute(position, destination)
            .then((road) => setRoadRoute(road ?? []))
            .finally(() => {
                routing.current = false;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, position?.latitude, position?.longitude, destination?.latitude, destination?.longitude]);

    return useMemo(() => {
        const empty = { remainingRoute: [], fullRoute: [], remainingMeters: null };
        if (!visible || !position) {
            return { position: null, ...empty, updatedAt: visible ? updatedAt : null, gotLive };
        }
        if (!destination) {
            return { position, ...empty, updatedAt, gotLive };
        }
        // Road route when available, otherwise a smooth curve from the rider.
        const hasRoad = !!roadRoute && roadRoute.length > 1;
        if (!hasRoad) {
            const curve = curvedPath(position, destination);
            return { position, remainingRoute: curve, fullRoute: [], remainingMeters: pathLength(curve), updatedAt, gotLive };
        }
        // Raw GPS drifts off the road (worse indoors). Close to the route → show
        // the rider ON the road; farther → show the real spot until we reroute.
        const snap = snapToRoute(roadRoute!, position);
        const onRoad = snap.distance <= SNAP_WITHIN_M;
        const shown = onRoad ? snap.point : position;
        const ahead = onRoad ? routeAhead(roadRoute!, position) : [position, ...routeAhead(roadRoute!, position)];
        return {
            position: shown,
            remainingRoute: ahead,
            fullRoute: hasRoad ? roadRoute! : [],
            remainingMeters: pathLength(ahead),
            updatedAt,
            gotLive,
        };
    }, [visible, position, destination, roadRoute, updatedAt, gotLive]);
}
