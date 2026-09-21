import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Sun, SunMoon } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { DisplayModeCard, type ThemeMode } from '@/components/theme/DisplayModeCard';
import { AccentColorPicker, type AccentColor } from '@/components/theme/AccentColorPicker';
import { ThemePreviewCard } from '@/components/theme/ThemePreviewCard';

type ThemePageProps = {
    onBack: () => void;
};

const ACCENT_COLORS: AccentColor[] = [
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

const THEME_MODES: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
    {
        id: 'light',
        label: 'Light',
        description: 'Clean and bright look',
        icon: <Sun size={22} color="#b77900" />,
    },
    {
        id: 'dark',
        label: 'Dark',
        description: 'Easy on the eyes',
        icon: <Moon size={22} color="#b77900" />,
    },
    {
        id: 'system',
        label: 'System',
        description: 'Match device settings',
        icon: <SunMoon size={22} color="#b77900" />,
    },
];

export function ThemePage({ onBack }: ThemePageProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [accent, setAccent] = useState<string>('amber');

    const selectedAccent = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center px-5 pb-4 pt-2">
                    <Pressable
                        className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white/70 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-950">Theme</Text>
                </View>

                <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
                    <Text className="mb-1 text-2xl font-lufga-bold text-slate-950">Appearance</Text>
                    <Text className="mb-5 text-base font-lufga text-slate-500">
                        Customize the look and feel of your app.
                    </Text>

                    <Text className="mb-3 text-lg font-lufga-bold text-slate-950">
                        Display mode
                    </Text>
                    <View className="mb-6">
                        {THEME_MODES.map((mode) => (
                            <DisplayModeCard
                                key={mode.id}
                                label={mode.label}
                                description={mode.description}
                                icon={mode.icon}
                                selected={themeMode === mode.id}
                                onPress={() => setThemeMode(mode.id)}
                            />
                        ))}
                    </View>

                    <Text className="mb-3 text-lg font-lufga-bold text-slate-950">
                        Accent color
                    </Text>
                    <View className="mb-6">
                        <AccentColorPicker
                            colors={ACCENT_COLORS}
                            selectedId={accent}
                            onSelect={setAccent}
                        />
                    </View>

                    <Text className="mb-3 text-lg font-lufga-bold text-slate-950">Preview</Text>
                    <View className="mb-6">
                        <ThemePreviewCard accent={selectedAccent} />
                    </View>

                    <GradientPill className="rounded-full h-12 mt-2">
                        <Pressable
                            className="flex-1 items-center justify-center active:opacity-80"
                            onPress={onBack}
                        >
                            <Text className="text-sm font-lufga-semibold text-slate-900">
                                Save changes
                            </Text>
                        </Pressable>
                    </GradientPill>
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
