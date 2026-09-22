import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AccentColor = {
    id: string;
    name: string;
    swatch: string;
    swatchLight: string;
    iconColor: string;
};

export const ACCENT_COLORS: AccentColor[] = [
    { id: 'amber', name: 'Amber', swatch: '#EAB308', swatchLight: '#fde68a', iconColor: '#b77900' },
    { id: 'rose', name: 'Rose', swatch: '#F43F5E', swatchLight: '#fecdd3', iconColor: '#9f1239' },
    {
        id: 'emerald',
        name: 'Emerald',
        swatch: '#10B981',
        swatchLight: '#a7f3d0',
        iconColor: '#065f46',
    },
    { id: 'sky', name: 'Sky', swatch: '#0EA5E9', swatchLight: '#bae6fd', iconColor: '#075985' },
    {
        id: 'violet',
        name: 'Violet',
        swatch: '#8B5CF6',
        swatchLight: '#ddd6fe',
        iconColor: '#5b21b6',
    },
    { id: 'slate', name: 'Slate', swatch: '#475569', swatchLight: '#cbd5e1', iconColor: '#1e293b' },
];

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
    accentId: string;
    mode: ThemeMode;
    setAccent: (id: string) => Promise<void>;
    setMode: (mode: ThemeMode) => Promise<void>;
    loadTheme: () => Promise<void>;
};

const DEFAULT_ACCENT = ACCENT_COLORS[0];

export const useThemeStore = create<ThemeState>((set) => ({
    accentId: DEFAULT_ACCENT.id,
    mode: 'light',

    setAccent: async (id) => {
        const valid = ACCENT_COLORS.find((c) => c.id === id) || DEFAULT_ACCENT;
        try {
            await AsyncStorage.setItem('theme_accent', valid.id);
        } catch {}
        set({ accentId: valid.id });
    },

    setMode: async (mode) => {
        try {
            await AsyncStorage.setItem('theme_mode', mode);
        } catch {}
        set({ mode });
    },

    loadTheme: async () => {
        try {
            const accentId = await AsyncStorage.getItem('theme_accent');
            const mode = (await AsyncStorage.getItem('theme_mode')) as ThemeMode | null;
            if (accentId && ACCENT_COLORS.some((c) => c.id === accentId)) {
                set({ accentId });
            }
            if (mode && ['light', 'dark', 'system'].includes(mode)) {
                set({ mode });
            }
        } catch {}
    },
}));
