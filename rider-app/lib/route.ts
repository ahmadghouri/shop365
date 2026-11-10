import { Platform } from 'react-native';
import type { LatLng } from './useLiveLocation';

const GOOGLE_MAPS_KEY = Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
    default: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
});

export function distanceMeters(a: LatLng, b: LatLng) {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLength(path: LatLng[]) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) total += distanceMeters(path[i], path[i + 1]);
    return total;
}

/** Standard Google encoded-polyline decoder. */
function decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    while (index < encoded.length) {
        for (const which of [0, 1]) {
            let result = 0;
            let shift = 0;
            let byte: number;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const delta = result & 1 ? ~(result >> 1) : result >> 1;
            if (which === 0) lat += delta;
            else lng += delta;
        }
        points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
}

/**
 * Road route for a two-wheeler via Google Routes API. Returns null when the
 * API isn't enabled / reachable — callers then draw a straight line.
 */
export async function fetchRoadRoute(origin: LatLng, destination: LatLng): Promise<LatLng[] | null> {
    if (!GOOGLE_MAPS_KEY) return null;
    try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
            },
            body: JSON.stringify({
                origin: { location: { latLng: origin } },
                destination: { location: { latLng: destination } },
                travelMode: 'TWO_WHEELER',
            }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        const encoded = data?.routes?.[0]?.polyline?.encodedPolyline;
        if (!encoded) return null;
        const path = decodePolyline(encoded);
        return path.length >= 2 ? [...path, destination] : null;
    } catch {
        return null;
    }
}

/**
 * Closest point ON the route (not just the closest vertex) to `position`.
 * Straight roads come back from Google as a few far-apart vertices, so
 * projecting onto each segment is what keeps the rider on the road.
 */
export function snapToRoute(route: LatLng[], position: LatLng): { point: LatLng; segment: number; distance: number } {
    if (route.length === 0) return { point: position, segment: 0, distance: Infinity };
    if (route.length === 1) return { point: route[0], segment: 0, distance: distanceMeters(route[0], position) };

    // Local flat projection (metres) around the rider — fine at city scale.
    const lat0 = (position.latitude * Math.PI) / 180;
    const mPerDegLat = 111_320;
    const mPerDegLng = 111_320 * Math.cos(lat0);
    const toXY = (p: LatLng) => ({
        x: (p.longitude - position.longitude) * mPerDegLng,
        y: (p.latitude - position.latitude) * mPerDegLat,
    });

    let best = { point: route[0], segment: 0, distance: Infinity };
    for (let i = 0; i < route.length - 1; i++) {
        const a = toXY(route[i]);
        const b = toXY(route[i + 1]);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len2 = dx * dx + dy * dy;
        // Rider is at (0,0); project it onto segment a→b.
        const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / len2));
        const px = a.x + t * dx;
        const py = a.y + t * dy;
        const d = Math.hypot(px, py);
        if (d < best.distance) {
            best = {
                point: {
                    latitude: position.latitude + py / mPerDegLat,
                    longitude: position.longitude + px / mPerDegLng,
                },
                segment: i,
                distance: d,
            };
        }
    }
    return best;
}

/** The part of `route` still ahead, starting from the rider's spot on the road. */
export function remainingRoute(route: LatLng[], position: LatLng): LatLng[] {
    if (route.length < 2) return route;
    const { point, segment } = snapToRoute(route, position);
    return [point, ...route.slice(segment + 1)];
}
