import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Check, Layers, LocateFixed, MapPin, X } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { useUpdateLocationMutation } from '@/api/users/useUpdateLocationMutation';
import type { UserLocationPayload } from '@/api/users/user.types';
import { GradientPill } from '@/components/reusable/GradientPill';

type LocationPickerModalProps = {
    visible: boolean;
    onClose: () => void;
};

type MapType = 'standard' | 'satellite' | 'terrain' | 'dark';

const DEFAULT_CENTER: [number, number] = [33.6844, 73.0479]; // Islamabad [lat, lng]

const MAP_TYPE_OPTIONS: { value: MapType; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'dark', label: 'Dark' },
];

function buildLeafletHtml(center: [number, number], zoom = 16): string {
    const [lat, lng] = center;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html, body, #map { height: 100%; margin: 0; padding: 0; }
.leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([${lat}, ${lng}], ${zoom});
var layers = {
  standard: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri, Maxar, Earthstar Geographics', maxZoom: 19 }),
  satelliteLabels: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri', maxZoom: 19 }),
  terrain: L.tileLayer('https://basemaps.cartocdn.com/rastertiles/terrain/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19 }),
  dark: L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19 })
};
var activeStyle = 'standard';
layers.standard.addTo(map);

function addLabels() {
  if (activeStyle === 'satellite' && !map.hasLayer(layers.satelliteLabels)) {
    map.addLayer(layers.satelliteLabels);
  }
}
function removeLabels() {
  if (activeStyle !== 'satellite' && map.hasLayer(layers.satelliteLabels)) {
    map.removeLayer(layers.satelliteLabels);
  }
}
addLabels();

function notifyCenter() {
  var c = map.getCenter();
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'center', lat: c.lat, lng: c.lng }));
  }
}
map.on('moveend', notifyCenter);

window.setStyle = function(name) {
  if (name === activeStyle) return;
  if (layers[name]) {
    map.removeLayer(layers[activeStyle]);
    if (map.hasLayer(layers.satelliteLabels)) {
      map.removeLayer(layers.satelliteLabels);
    }
    layers[name].addTo(map);
    activeStyle = name;
    if (name === 'satellite') {
      map.addLayer(layers.satelliteLabels);
    }
  }
};

window.setCenter = function(lat, lng) {
  map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
};

setTimeout(notifyCenter, 500);
</script>
</body>
</html>`;
}

async function reverseGeocode(lng: number, lat: number): Promise<Location.LocationGeocodedAddress | null> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results && results.length > 0) return results[0];
    } catch {
        // fall through to Nominatim
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'User-Agent': 'Shop365' } },
        );
        if (!response.ok) return null;
        const data = await response.json();
        const a = data?.address;
        if (!a) return null;
        return {
            name: data?.name ?? null,
            street: a.road ?? a.pedestrian ?? a.footway ?? null,
            district: a.suburb ?? a.neighbourhood ?? a.quarter ?? null,
            city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
            region: a.state ?? null,
            subregion: a.county ?? null,
            country: a.country ?? null,
            postalCode: a.postcode ?? null,
            streetNumber: a.house_number ?? null,
        } as Location.LocationGeocodedAddress;
    } catch {
        return null;
    }
}

function buildAddress(result: Location.LocationGeocodedAddress | null): string {
    const street = result?.street || result?.name || '';
    const area = result?.district || result?.subregion || result?.region || '';
    const city = result?.city || result?.region || '';
    return [...new Set([street, area, city].filter(Boolean))].join(', ') || 'Selected location';
}

export function LocationPickerModal({ visible, onClose }: LocationPickerModalProps) {
    const user = useAuthStore((state) => state.user);
    const updateLocation = useUpdateLocationMutation();

    const webviewRef = useRef<WebView>(null);
    const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const savedLat = typeof user?.latitude === 'number' ? user.latitude : undefined;
    const savedLng = typeof user?.longitude === 'number' ? user.longitude : undefined;
    const initialCenter: [number, number] =
        savedLat !== undefined && savedLng !== undefined ? [savedLat, savedLng] : DEFAULT_CENTER;

    const [center, setCenter] = useState<[number, number]>(initialCenter);
    const [address, setAddress] = useState('');
    const [resolving, setResolving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mapType, setMapType] = useState<MapType>('standard');
    const [showMapTypes, setShowMapTypes] = useState(false);

    const leafletHtml = buildLeafletHtml(initialCenter);

    const resolveAt = useCallback(async (lng: number, lat: number) => {
        setResolving(true);
        try {
            const result = await reverseGeocode(lng, lat);
            setAddress(buildAddress(result));
        } catch {
            setAddress('Selected location');
        } finally {
            setResolving(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            const [lat, lng] = initialCenter;
            resolveAt(lng, lat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'center') {
                setCenter([data.lat, data.lng]);
                if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
                geocodeTimer.current = setTimeout(() => {
                    resolveAt(data.lng, data.lat);
                }, 400);
            }
        } catch {
            // Ignore malformed messages
        }
    };

    const changeMapType = (type: MapType) => {
        setMapType(type);
        setShowMapTypes(false);
        webviewRef.current?.injectJavaScript(`window.setStyle('${type}'); true;`);
    };

    const handleLocateMe = async () => {
        setLocating(true);
        try {
            const currentPermission = await Location.getForegroundPermissionsAsync();
            const permission = currentPermission.granted
                ? currentPermission
                : await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') return;

            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = current.coords;
            webviewRef.current?.injectJavaScript(`window.setCenter(${latitude}, ${longitude}); true;`);
            await resolveAt(longitude, latitude);
        } catch {
            // Ignore location failures; user can still pan the map
        } finally {
            setLocating(false);
        }
    };

    const handleConfirm = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const [lat, lng] = center;
            const result = await reverseGeocode(lng, lat);
            const street = result?.street || result?.name || '';
            const area = result?.district || result?.subregion || result?.region || '';
            const city = result?.city || result?.region || '';
            const addressText = buildAddress(result);

            const payload: UserLocationPayload = {
                address: addressText,
                street,
                area,
                city,
                latitude: lat,
                longitude: lng,
            };

            const userId = user?._id || user?.id;
            if (userId) {
                await updateLocation.mutateAsync({ userId, location: payload });
            }
            onClose();
        } catch {
            // Keep modal open so the user can retry
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-slate-100">
                <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                    style={{ flex: 1 }}
                    source={{ html: leafletHtml }}
                    onMessage={handleMessage}
                />

                {/* Center pin */}
                <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                    <MapPin size={40} color="#EAB308" fill="#EAB308" />
                </View>

                {/* Header */}
                <View className="absolute left-4 right-4 top-12 z-10 flex-row items-center justify-between">
                    <Pressable
                        className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                        onPress={onClose}
                    >
                        <X size={20} color="#171717" />
                    </Pressable>
                    <Text className="mx-3 flex-1 text-center text-base font-lufga-bold text-slate-950">
                        Select Location
                    </Text>
                    <Pressable
                        className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                        onPress={() => setShowMapTypes((v) => !v)}
                    >
                        <Layers size={20} color="#171717" />
                    </Pressable>
                </View>

                {/* Map type menu */}
                {showMapTypes && (
                    <View className="absolute right-4 top-[6.5rem] z-20 rounded-2xl bg-white p-1.5 shadow-lg">
                        {MAP_TYPE_OPTIONS.map((option) => {
                            const selected = mapType === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    className={`flex-row items-center rounded-xl px-3 py-2.5 ${selected ? 'bg-amber-50' : ''}`}
                                    onPress={() => changeMapType(option.value)}
                                >
                                    <Text className={`text-sm font-lufga-semibold ${selected ? 'text-amber-700' : 'text-slate-700'}`}>
                                        {option.label}
                                    </Text>
                                    {selected && <Check size={16} color="#b77900" className="ml-2" />}
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {/* Locate me */}
                <Pressable
                    className="absolute bottom-52 right-4 z-10 h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                    disabled={locating}
                    onPress={handleLocateMe}
                >
                    {locating ? (
                        <ActivityIndicator size="small" color="#171717" />
                    ) : (
                        <LocateFixed size={20} color="#171717" />
                    )}
                </Pressable>

                {/* Bottom sheet */}
                <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
                    <View className="rounded-t-[28px] bg-white p-5 shadow-lg shadow-slate-300">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                                <MapPin size={18} color="#b77900" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-xs font-lufga text-slate-400">Delivery Address</Text>
                                {resolving ? (
                                    <Text className="mt-0.5 font-lufga-semibold text-slate-950">
                                        Resolving address...
                                    </Text>
                                ) : (
                                    <Text className="mt-0.5 font-lufga-semibold text-slate-950" numberOfLines={2}>
                                        {address}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <GradientPill className="mt-4 w-full rounded-full h-14">
                            <Pressable
                                className="flex-1 items-center justify-center"
                                disabled={saving}
                                onPress={handleConfirm}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#171717" />
                                ) : (
                                    <Text className="text-slate-900 font-lufga-bold text-base">
                                        Confirm Location
                                    </Text>
                                )}
                            </Pressable>
                        </GradientPill>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}
