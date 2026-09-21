import { Platform } from 'react-native';
import * as Device from 'expo-device';

export function getLoginDeviceName(): string {
    if (Platform.OS === 'web') {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        if (/Windows/i.test(userAgent)) return 'Windows';
        if (/Macintosh|Mac OS/i.test(userAgent)) return 'Mac';
        if (/iPhone|iPad/i.test(userAgent)) return 'iPhone';
        if (/Android/i.test(userAgent)) return 'Android';
        return 'Web Browser';
    }

    return Device.modelName || Device.deviceName || (Platform.OS === 'ios' ? 'iPhone' : 'Android device');
}
