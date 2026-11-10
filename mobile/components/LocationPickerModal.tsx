import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, {
    PROVIDER_GOOGLE,
    type LatLng,
    type MapPressEvent,
    type MapType as GoogleMapType,
    type PoiClickEvent,
    type Region,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { ArrowLeft, Check, Layers, LocateFixed, MapPin, Search, X } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { useUpdateLocationMutation } from '@/api/users/useUpdateLocationMutation';
import type { UserLocationPayload } from '@/api/users/user.types';
import { GradientPill } from '@/components/reusable/GradientPill';

export type PickedLocation = UserLocationPayload & { placeName?: string };

type LocationPickerModalProps = {
    visible: boolean;
    onClose: () => void;
    /**
     * When given, the picked location is handed back here instead of being
     * saved as the user's profile location.
     */
    onConfirm?: (location: PickedLocation) => void;
    /** Where the map opens; falls back to the user's saved location. */
    initialLocation?: { latitude: number; longitude: number } | null;
};

type MapType = 'standard' | 'satellite' | 'terrain' | 'dark';

type Suggestion = {
    id: string;
    title: string;
    subtitle: string;
    placeId?: string;
    coordinate?: LatLng;
};

const DEFAULT_CENTER: [number, number] = [33.6844, 73.0479]; // Islamabad [lat, lng]
const DEFAULT_DELTA = 0.01;

// Google's "dark" look is a custom style on the standard map.
const GOOGLE_MAP_TYPE: Record<MapType, GoogleMapType> = {
    standard: 'standard',
    satellite: 'hybrid',
    terrain: 'terrain',
    dark: 'standard',
};

const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
];

const MAP_TYPE_OPTIONS: { value: MapType; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'dark', label: 'Dark' },
];

const GOOGLE_MAPS_KEY = Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
    default: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
});

async function reverseGeocode(lng: number, lat: number): Promise<Location.LocationGeocodedAddress | null> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results && results.length > 0) return results[0];
    } catch {
        // fall through to Google Geocoding API
    }

    if (!GOOGLE_MAPS_KEY) return null;
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`,
        );
        if (!response.ok) return null;
        const data = await response.json();
        const first = data?.results?.[0];
        if (!first) return null;
        const get = (type: string) =>
            first.address_components?.find((c: { types: string[] }) => c.types.includes(type))?.long_name ?? null;
        return {
            name: null,
            street: get('route'),
            district: get('sublocality') ?? get('neighborhood'),
            city: get('locality'),
            region: get('administrative_area_level_1'),
            subregion: get('administrative_area_level_2'),
            country: get('country'),
            postalCode: get('postal_code'),
            streetNumber: get('street_number'),
            formattedAddress: first.formatted_address ?? null,
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

const newSessionToken = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/** Google Places (New) autocomplete, biased towards where the map is looking. */
async function placesAutocomplete(input: string, near: LatLng, sessionToken: string): Promise<Suggestion[]> {
    if (!GOOGLE_MAPS_KEY) return [];
    try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_MAPS_KEY },
            body: JSON.stringify({
                input,
                sessionToken,
                includedRegionCodes: ['pk'], // Pakistan only
                regionCode: 'pk',
                locationBias: { circle: { center: near, radius: 50000 } },
            }),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return (data?.suggestions ?? [])
            .map((s: any) => s?.placePrediction)
            .filter(Boolean)
            .map((p: any) => ({
                id: p.placeId,
                placeId: p.placeId,
                title: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
                subtitle: p.structuredFormat?.secondaryText?.text ?? '',
            }));
    } catch {
        return [];
    }
}

async function placeDetails(
    placeId: string,
    sessionToken: string,
): Promise<{ coordinate: LatLng; name: string } | null> {
    if (!GOOGLE_MAPS_KEY) return null;
    try {
        const response = await fetch(
            `https://places.googleapis.com/v1/places/${placeId}?sessionToken=${sessionToken}`,
            {
                headers: {
                    'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                    'X-Goog-FieldMask': 'location,displayName',
                },
            },
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data?.location) return null;
        return {
            coordinate: { latitude: data.location.latitude, longitude: data.location.longitude },
            name: data.displayName?.text ?? '',
        };
    } catch {
        return null;
    }
}

// Rough bounding box of Pakistan, used to drop device-geocoder results abroad.
const isInPakistan = (lat: number, lng: number) =>
    lat >= 23.5 && lat <= 37.2 && lng >= 60.8 && lng <= 77.9;

/** Fallback when Places has nothing: the phone's own geocoder (Pakistan only). */
async function deviceSearch(input: string): Promise<Suggestion[]> {
    try {
        const results = await Location.geocodeAsync(input);
        return results
            .filter((r) => isInPakistan(r.latitude, r.longitude))
            .slice(0, 3)
            .map((r, i) => ({
            id: `device-${i}`,
            title: input,
            subtitle: `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`,
            coordinate: { latitude: r.latitude, longitude: r.longitude },
        }));
    } catch {
        return [];
    }
}

export function LocationPickerModal({ visible, onClose, onConfirm, initialLocation }: LocationPickerModalProps) {
    const user = useAuthStore((state) => state.user);
    const updateLocation = useUpdateLocationMutation();
    const insets = useSafeAreaInsets();

    const mapRef = useRef<MapView>(null);
    const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchSeq = useRef(0);
    const sessionToken = useRef(newSessionToken());

    const savedLat = typeof user?.latitude === 'number' ? user.latitude : undefined;
    const savedLng = typeof user?.longitude === 'number' ? user.longitude : undefined;
    const initialCenter: [number, number] = initialLocation
        ? [initialLocation.latitude, initialLocation.longitude]
        : savedLat !== undefined && savedLng !== undefined
            ? [savedLat, savedLng]
            : DEFAULT_CENTER;

    const [center, setCenter] = useState<[number, number]>(initialCenter);
    const [address, setAddress] = useState('');
    const [resolving, setResolving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mapType, setMapType] = useState<MapType>('standard');
    const [showMapTypes, setShowMapTypes] = useState(false);
    // Name of a tapped/searched place, kept while the pin stays on it.
    const [placeName, setPlaceName] = useState('');
    const tappedPoi = useRef<{ coordinate: LatLng; name: string } | null>(null);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [searching, setSearching] = useState(false);
    const [noResults, setNoResults] = useState(false);

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
            setCenter(initialCenter);
            setPlaceName('');
            tappedPoi.current = null;
            setQuery('');
            setSuggestions([]);
            setNoResults(false);
            setShowMapTypes(false);
            sessionToken.current = newSessionToken();
            resolveAt(lng, lat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => () => {
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        if (searchTimer.current) clearTimeout(searchTimer.current);
    }, []);

    const focusOn = (coordinate: LatLng, name: string) => {
        tappedPoi.current = name ? { coordinate, name } : null;
        setPlaceName(name);
        mapRef.current?.animateToRegion(
            { ...coordinate, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA },
            500,
        );
    };

    // ---- Search ----
    const runSearch = async (text: string) => {
        const seq = ++searchSeq.current;
        setSearching(true);
        try {
            const near = { latitude: center[0], longitude: center[1] };
            let results = await placesAutocomplete(text, near, sessionToken.current);
            if (results.length === 0) results = await deviceSearch(text);
            if (seq === searchSeq.current) {
                setSuggestions(results);
                setNoResults(results.length === 0);
            }
        } finally {
            if (seq === searchSeq.current) setSearching(false);
        }
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        setNoResults(false);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (text.trim().length < 2) {
            searchSeq.current++;
            setSuggestions([]);
            setSearching(false);
            return;
        }
        searchTimer.current = setTimeout(() => runSearch(text.trim()), 350);
    };

    const handleSubmitSearch = () => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (query.trim().length >= 2) runSearch(query.trim());
    };

    const clearSearch = () => {
        searchSeq.current++;
        setQuery('');
        setSuggestions([]);
        setSearching(false);
        setNoResults(false);
    };

    const handleSelectSuggestion = async (suggestion: Suggestion) => {
        Keyboard.dismiss();
        setSuggestions([]);
        setQuery(suggestion.title);

        let coordinate = suggestion.coordinate;
        let name = suggestion.title;
        if (!coordinate && suggestion.placeId) {
            setSearching(true);
            const details = await placeDetails(suggestion.placeId, sessionToken.current);
            setSearching(false);
            sessionToken.current = newSessionToken();
            coordinate = details?.coordinate;
            name = details?.name || name;
        }
        if (!coordinate) {
            setNoResults(true);
            return;
        }
        focusOn(coordinate, name);
    };

    // ---- Map interaction ----
    // Tap anywhere on the map: move the pin there.
    const handleMapPress = (event: MapPressEvent) => {
        Keyboard.dismiss();
        setSuggestions([]);
        setShowMapTypes(false);
        tappedPoi.current = null;
        setPlaceName('');
        mapRef.current?.animateCamera({ center: event.nativeEvent.coordinate }, { duration: 400 });
    };

    // Tap a Google place: move the pin there and show the place's name.
    const handlePoiClick = (event: PoiClickEvent) => {
        const { coordinate, name } = event.nativeEvent;
        const cleanName = (name ?? '').split('\n')[0].trim();
        Keyboard.dismiss();
        setSuggestions([]);
        tappedPoi.current = { coordinate, name: cleanName };
        setPlaceName(cleanName);
        mapRef.current?.animateCamera({ center: coordinate }, { duration: 400 });
    };

    const handleRegionChangeComplete = (region: Region) => {
        const poi = tappedPoi.current;
        const stillOnPoi =
            poi &&
            Math.abs(poi.coordinate.latitude - region.latitude) < 0.0002 &&
            Math.abs(poi.coordinate.longitude - region.longitude) < 0.0002;
        if (!stillOnPoi) {
            tappedPoi.current = null;
            setPlaceName('');
        }
        setCenter([region.latitude, region.longitude]);
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        geocodeTimer.current = setTimeout(() => {
            resolveAt(region.longitude, region.latitude);
        }, 400);
    };

    const changeMapType = (type: MapType) => {
        setMapType(type);
        setShowMapTypes(false);
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
            focusOn({ latitude, longitude }, '');
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
            const baseAddress = buildAddress(result);
            const addressText =
                placeName && !baseAddress.startsWith(placeName) ? `${placeName}, ${baseAddress}` : baseAddress;

            const payload: UserLocationPayload = {
                address: addressText,
                street,
                area,
                city,
                latitude: lat,
                longitude: lng,
            };

            if (onConfirm) {
                onConfirm({ ...payload, placeName: placeName || undefined });
            } else {
                const userId = user?._id || user?.id;
                if (userId) {
                    await updateLocation.mutateAsync({ userId, location: payload });
                }
            }
            onClose();
        } catch {
            // Keep the page open so the user can retry
        } finally {
            setSaving(false);
        }
    };

    const showDropdown = suggestions.length > 0 || noResults;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-slate-100">
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: initialCenter[0],
                        longitude: initialCenter[1],
                        latitudeDelta: DEFAULT_DELTA,
                        longitudeDelta: DEFAULT_DELTA,
                    }}
                    mapType={GOOGLE_MAP_TYPE[mapType]}
                    customMapStyle={mapType === 'dark' ? DARK_MAP_STYLE : []}
                    showsUserLocation
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    onPress={handleMapPress}
                    onPoiClick={handlePoiClick}
                />

                {/* Center pin */}
                <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                    <MapPin size={40} color="#EAB308" fill="#EAB308" />
                </View>

                {/* Top bar: back, search, map type */}
                <View
                    className="absolute left-0 right-0 top-0 z-10 px-4"
                    style={{ paddingTop: insets.top + 12 }}
                >
                    <View className="flex-row items-center">
                        <Pressable
                            className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                            onPress={onClose}
                        >
                            <ArrowLeft size={20} color="#171717" />
                        </Pressable>

                        <View className="mx-2 h-12 flex-1 flex-row items-center rounded-full bg-white px-4 shadow-md">
                            <Search size={18} color="#94a3b8" />
                            <TextInput
                                className="ml-2 flex-1 font-lufga text-slate-950"
                                value={query}
                                onChangeText={handleQueryChange}
                                onSubmitEditing={handleSubmitSearch}
                                placeholder="Search or type your address"
                                placeholderTextColor="#94a3b8"
                                returnKeyType="search"
                                autoCorrect={false}
                            />
                            {searching ? (
                                <ActivityIndicator size="small" color="#b77900" />
                            ) : query ? (
                                <Pressable hitSlop={10} onPress={clearSearch}>
                                    <X size={18} color="#64748b" />
                                </Pressable>
                            ) : null}
                        </View>

                        <Pressable
                            className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                            onPress={() => {
                                Keyboard.dismiss();
                                setShowMapTypes((v) => !v);
                            }}
                        >
                            <Layers size={20} color="#171717" />
                        </Pressable>
                    </View>

                    {/* Search results */}
                    {showDropdown && (
                        <View className="mt-2 max-h-80 overflow-hidden rounded-3xl bg-white shadow-lg">
                            {noResults ? (
                                <Text className="px-5 py-4 font-lufga text-slate-500">
                                    No places found. Try another name, or tap the map.
                                </Text>
                            ) : (
                                <FlatList
                                    data={suggestions}
                                    keyExtractor={(item) => item.id}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item, index }) => (
                                        <Pressable
                                            className={`flex-row items-center px-4 py-3 active:bg-slate-50 ${index > 0 ? 'border-t border-slate-100' : ''}`}
                                            onPress={() => handleSelectSuggestion(item)}
                                        >
                                            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                                                <MapPin size={16} color="#b77900" />
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="font-lufga-semibold text-slate-950" numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                {item.subtitle ? (
                                                    <Text className="text-xs font-lufga text-slate-400" numberOfLines={1}>
                                                        {item.subtitle}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </Pressable>
                                    )}
                                />
                            )}
                        </View>
                    )}

                    {/* Map type menu */}
                    {showMapTypes && !showDropdown && (
                        <View className="mt-2 self-end rounded-2xl bg-white p-1.5 shadow-lg">
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
                </View>

                {/* Locate me */}
                <Pressable
                    className="absolute bottom-52 right-4 z-10 h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:opacity-70"
                    style={{ marginBottom: insets.bottom }}
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
                <View
                    className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white p-5 shadow-lg shadow-slate-300"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <Text className="mb-3 text-center text-xs font-lufga text-slate-400">
                        Move the map, tap a place, or search above
                    </Text>
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                            <MapPin size={18} color="#b77900" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-xs font-lufga text-slate-400">Delivery Address</Text>
                            {placeName ? (
                                <Text className="mt-0.5 text-base font-lufga-bold text-slate-950" numberOfLines={1}>
                                    {placeName}
                                </Text>
                            ) : null}
                            {resolving ? (
                                <Text className="mt-0.5 font-lufga-semibold text-slate-950">
                                    Resolving address...
                                </Text>
                            ) : (
                                <Text
                                    className={`mt-0.5 ${placeName ? 'font-lufga text-slate-500' : 'font-lufga-semibold text-slate-950'}`}
                                    numberOfLines={2}
                                >
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
            </View>
        </Modal>
    );
}
