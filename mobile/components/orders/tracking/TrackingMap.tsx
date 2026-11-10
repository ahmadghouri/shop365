import { useEffect, useRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { ACCENT, ACCENT_DARK } from './trackingConstants';
import { DestinationPin } from './DestinationPin';
import { RiderPin } from './RiderPin';

const DEFAULT_CENTER = { latitude: 33.6844, longitude: 73.0479 }; // Islamabad
const DELTA = 0.012;

type TrackingMapProps = {
    /** Delivery address chosen at checkout (the only customer location shown). */
    latitude?: number | null;
    longitude?: number | null;
    title?: string;
    /** Space covered by overlays (back button / bottom sheet) so the pin stays visible. */
    topInset: number;
    bottomInset: number;
    /** Live rider position + route still to drive. */
    riderPosition?: LatLng | null;
    remainingRoute?: LatLng[];
    /** Whole route; when it changes the map zooms out to show all of it. */
    fullRoute?: LatLng[];
};

/** Real Google map behind the tracking sheet, pinned on the delivery address. */
export function TrackingMap({
    latitude,
    longitude,
    title,
    topInset,
    bottomInset,
    riderPosition,
    remainingRoute = [],
    fullRoute = [],
}: TrackingMapProps) {
    const mapRef = useRef<MapView>(null);
    // Note: the custom markers keep the default tracksViewChanges (true). Turning
    // it off makes Android snapshot the view once — the rider marker (which
    // appears later) and the SVG icons then render blank.

    const hasDestination = typeof latitude === 'number' && typeof longitude === 'number';
    // Everything from the start of the route up to the rider's current point.
    const travelledRoute =
        fullRoute.length > 1 && remainingRoute.length > 0
            ? fullRoute.slice(0, fullRoute.length - remainingRoute.length + 1)
            : [];
    // Only the order's delivery address and the rider are shown — never the
    // customer's own live location.
    const center = hasDestination
        ? { latitude: latitude as number, longitude: longitude as number }
        : riderPosition ?? DEFAULT_CENTER;

    // The order detail (with coordinates) can arrive after the first render.
    useEffect(() => {
        if (!hasDestination) return;
        mapRef.current?.animateToRegion(
            { ...center, latitudeDelta: DELTA, longitudeDelta: DELTA },
            400,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latitude, longitude, bottomInset]);

    // First time the rider shows up, frame rider + destination together.
    const riderFramed = useRef(false);
    useEffect(() => {
        if (!riderPosition || riderFramed.current) return;
        riderFramed.current = true;
        const points = hasDestination ? [riderPosition, center] : [riderPosition];
        if (points.length > 1) {
            mapRef.current?.fitToCoordinates(points, {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true,
            });
        } else {
            mapRef.current?.animateToRegion({ ...riderPosition, latitudeDelta: DELTA, longitudeDelta: DELTA }, 400);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [riderPosition]);

    // When a ride starts, frame the whole route (rider + destination).
    useEffect(() => {
        if (fullRoute.length < 2) return;
        mapRef.current?.fitToCoordinates(fullRoute, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
        });
    }, [fullRoute]);

    return (
        <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{ ...center, latitudeDelta: DELTA, longitudeDelta: DELTA }}
            mapPadding={{ top: topInset, bottom: bottomInset, left: 0, right: 0 }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
        >
            {/* Part already driven: faded grey */}
            {travelledRoute.length > 1 ? (
                <Polyline
                    coordinates={travelledRoute}
                    strokeColor="#CBD5E1"
                    strokeWidth={5}
                    lineCap="round"
                    lineJoin="round"
                    zIndex={1}
                />
            ) : null}

            {/* Road ahead: dark outline with the brand yellow on top */}
            {remainingRoute.length > 1 ? (
                <Polyline
                    coordinates={remainingRoute}
                    strokeColor={ACCENT_DARK}
                    strokeWidth={9}
                    lineCap="round"
                    lineJoin="round"
                    zIndex={2}
                />
            ) : null}
            {remainingRoute.length > 1 ? (
                <Polyline
                    coordinates={remainingRoute}
                    strokeColor={ACCENT}
                    strokeWidth={5}
                    lineCap="round"
                    lineJoin="round"
                    zIndex={3}
                />
            ) : null}

            {riderPosition ? (
                <Marker
                    coordinate={riderPosition}
                    title="Your rider"
                    anchor={{ x: 0.5, y: 0.5 }}
                    zIndex={10}
                >
                    <RiderPin />
                </Marker>
            ) : null}

            {hasDestination ? (
                <Marker
                    coordinate={center}
                    title={title || 'Delivery address'}
                    anchor={{ x: 0.5, y: 1 }}
                    zIndex={5}
                >
                    <DestinationPin />
                </Marker>
            ) : null}
        </MapView>
    );
}
