import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PUSH = 'notif_push_enabled';
const KEY_SOUND = 'notif_sound_enabled';
const KEY_ALERTS = 'notif_alerts_enabled';

type NotificationSettingsStore = {
    /** Master switch: whether push notifications are allowed to show at all. */
    pushEnabled: boolean;
    /** Play a sound when a notification arrives. */
    soundEnabled: boolean;
    /** Show the in-app banner/alert when a notification arrives. */
    alertsEnabled: boolean;
    loaded: boolean;
    setPushEnabled: (v: boolean) => Promise<void>;
    setSoundEnabled: (v: boolean) => Promise<void>;
    setAlertsEnabled: (v: boolean) => Promise<void>;
    loadSettings: () => Promise<void>;
};

export const useNotificationSettingsStore = create<NotificationSettingsStore>()((set) => ({
    pushEnabled: true,
    soundEnabled: true,
    alertsEnabled: true,
    loaded: false,

    setPushEnabled: async (v) => {
        try {
            await AsyncStorage.setItem(KEY_PUSH, v ? '1' : '0');
        } catch {}
        set({ pushEnabled: v });
    },
    setSoundEnabled: async (v) => {
        try {
            await AsyncStorage.setItem(KEY_SOUND, v ? '1' : '0');
        } catch {}
        set({ soundEnabled: v });
    },
    setAlertsEnabled: async (v) => {
        try {
            await AsyncStorage.setItem(KEY_ALERTS, v ? '1' : '0');
        } catch {}
        set({ alertsEnabled: v });
    },

    loadSettings: async () => {
        try {
            const [push, sound, alerts] = await Promise.all([
                AsyncStorage.getItem(KEY_PUSH),
                AsyncStorage.getItem(KEY_SOUND),
                AsyncStorage.getItem(KEY_ALERTS),
            ]);
            set({
                pushEnabled: push === null ? true : push === '1',
                soundEnabled: sound === null ? true : sound === '1',
                alertsEnabled: alerts === null ? true : alerts === '1',
                loaded: true,
            });
        } catch {
            set({ loaded: true });
        }
    },
}));
