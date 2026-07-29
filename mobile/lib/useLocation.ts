import { useState } from 'react';
import * as Location from 'expo-location';
import type { UserLocationPayload } from '@/api/users/user.types';

let hasLoggedAddress = false;

type LocationState = {
    location: UserLocationPayload | null;
    loading: boolean;
    error: string | null;
    detectLocation: () => Promise<UserLocationPayload | null>;
};

export function useLocation(): LocationState {
    const [location, setLocation] = useState<UserLocationPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectLocation = async () => {
        setLoading(true);
        setError(null);

        try {
            const currentPermission = await Location.getForegroundPermissionsAsync();
            const permission = currentPermission.granted
                ? currentPermission
                : await Location.requestForegroundPermissionsAsync();

            if (permission.status !== 'granted') {
                setError('Location permission denied');
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const coordinates = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };
            const [result] = await Location.reverseGeocodeAsync(coordinates);

            const street = result?.street || result?.name || '';
            const area = result?.district || result?.subregion || result?.region || '';
            const city = result?.city || result?.region || '';
            const address = [...new Set([street, area, city].filter(Boolean))].join(', ') || 'Location found';
            const detected = { address, street, area, city, ...coordinates };

            setLocation(detected);
            if (!hasLoggedAddress) {
                console.log('Current address:', address);
                hasLoggedAddress = true;
            }
            return detected;
        } catch (err: any) {
            setError(err.message || 'Failed to get location');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { location, loading, error, detectLocation };
}
