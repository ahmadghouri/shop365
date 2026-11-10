import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { sendRiderLocation } from './riderOrders';

export type LatLng = { latitude: number; longitude: number };

const SEND_EVERY_MS = 10_000;

/**
 * Watches the rider's GPS while `active` is true and (optionally) reports it to
 * the backend every 10s so the customer can follow the delivery.
 */
export function useLiveLocation(active: boolean, report = true) {
    const [position, setPosition] = useState<LatLng | null>(null);
    const [heading, setHeading] = useState<number | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const lastSent = useRef(0);

    useEffect(() => {
        if (!active) return;
        let sub: Location.LocationSubscription | null = null;
        let cancelled = false;

        (async () => {
            const current = await Location.getForegroundPermissionsAsync();
            const perm = current.granted ? current : await Location.requestForegroundPermissionsAsync();
            if (!perm.granted) {
                if (!cancelled) setPermissionDenied(true);
                return;
            }
            setPermissionDenied(false);

            sub = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
                (loc) => {
                    const p = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                    setPosition(p);
                    if (typeof loc.coords.heading === 'number' && loc.coords.heading >= 0) {
                        setHeading(loc.coords.heading);
                    }
                    const now = Date.now();
                    if (report && now - lastSent.current >= SEND_EVERY_MS) {
                        lastSent.current = now;
                        sendRiderLocation(p.latitude, p.longitude).catch(() => {
                            // Network blip — try again on the next fix.
                            lastSent.current = 0;
                        });
                    }
                }
            );
            if (cancelled) sub.remove();
        })();

        return () => {
            cancelled = true;
            sub?.remove();
        };
    }, [active, report]);

    return { position, heading, permissionDenied };
}
