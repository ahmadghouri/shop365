import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
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


export function ThemePage({ onBack }: ThemePageProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [accent, setAccent] = useState<string>('amber');

    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const pad = isTiny ? 14 : isSmall ? 16 : 20;
    const iconBtnSize = isTiny ? 38 : isSmall ? 40 : 44;
    const pageIconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const headerTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const sectionTitleSize = isTiny ? 15 : isSmall ? 16 : 18;
    const subTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const bodySize = isTiny ? 12 : isSmall ? 13 : 16;
    const modeIconSize = isTiny ? 18 : isSmall ? 20 : 22;
    const saveBtnHeight = isTiny ? 46 : isSmall ? 48 : 52;
    const saveBtnFontSize = isTiny ? 12 : isSmall ? 13 : 15;

    const selectedAccent = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

    const themeModes: { id: ThemeMode; label: string; description: string; icon: React.ReactNode }[] = [
        { id: 'light', label: 'Light', description: 'Clean and bright look', icon: <Sun size={modeIconSize} color="#b77900" /> },
        { id: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: <Moon size={modeIconSize} color="#b77900" /> },
        { id: 'system', label: 'System', description: 'Match device settings', icon: <SunMoon size={modeIconSize} color="#b77900" /> },
    ];

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* ── Header ── */}
                <View
                    style={{ paddingHorizontal: pad, paddingBottom: isTiny ? 10 : 14, paddingTop: isTiny ? 6 : 8 }}
                    className="flex-row items-center"
                >
                    <Pressable
                        style={{ height: iconBtnSize, width: iconBtnSize, marginRight: isTiny ? 8 : 12 }}
                        className="items-center justify-center rounded-2xl bg-white/70 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={pageIconSize} color="#171717" />
                    </Pressable>
                    <Text style={{ fontSize: headerTitleSize }} className="font-lufga-bold text-slate-950">
                        Theme
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: 36 }}
                >
                    {/* ── Page intro ── */}
                    <Text style={{ fontSize: subTitleSize, marginBottom: isTiny ? 3 : 4 }} className="font-lufga-bold text-slate-950">
                        Appearance
                    </Text>
                    <Text style={{ fontSize: bodySize, marginBottom: isTiny ? 18 : 24 }} className="font-lufga text-slate-500">
                        Customize the look and feel of your app.
                    </Text>

                    {/* ── Display mode ── */}
                    <Text style={{ fontSize: sectionTitleSize, marginBottom: isTiny ? 8 : 12 }} className="font-lufga-bold text-slate-950">
                        Display mode
                    </Text>
                    <View style={{ marginBottom: isTiny ? 20 : 24 }}>
                        {themeModes.map((mode) => (
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

                    {/* ── Accent color ── */}
                    <Text style={{ fontSize: sectionTitleSize, marginBottom: isTiny ? 8 : 12 }} className="font-lufga-bold text-slate-950">
                        Accent color
                    </Text>
                    <View style={{ marginBottom: isTiny ? 20 : 24 }}>
                        <AccentColorPicker
                            colors={ACCENT_COLORS}
                            selectedId={accent}
                            onSelect={setAccent}
                        />
                    </View>

                    {/* ── Preview ── */}
                    <Text style={{ fontSize: sectionTitleSize, marginBottom: isTiny ? 8 : 12 }} className="font-lufga-bold text-slate-950">
                        Preview
                    </Text>
                    <View style={{ marginBottom: isTiny ? 20 : 24 }}>
                        <ThemePreviewCard accent={selectedAccent} />
                    </View>

                    {/* ── Save button ── */}
                    <GradientPill style={{ height: saveBtnHeight }} className="mt-2 rounded-full">
                        <Pressable
                            className="flex-1 items-center justify-center active:opacity-80"
                            onPress={onBack}
                        >
                            <Text style={{ fontSize: saveBtnFontSize }} className="font-lufga-semibold text-slate-900">
                                Save changes
                            </Text>
                        </Pressable>
                    </GradientPill>
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
