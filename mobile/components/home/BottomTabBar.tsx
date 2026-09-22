import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Home, ListChecks, ClipboardList, User } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';

type BottomTabBarProps = {
    activeTab?: string;
    onHomePress?: () => void;
    onListPress?: () => void;
    onOrdersPress?: () => void;
    onProfilePress?: () => void;
};

const TABS = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'list', label: 'List', Icon: ListChecks },
    { key: 'orders', label: 'Orders', Icon: ClipboardList },
    { key: 'profile', label: 'Profile', Icon: User },
] as const;

export function BottomTabBar({
    activeTab = 'home',
    onHomePress,
    onListPress,
    onOrdersPress,
    onProfilePress,
}: BottomTabBarProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const handlers = {
        home: onHomePress,
        list: onListPress,
        orders: onOrdersPress,
        profile: onProfilePress,
    };

    const bottomOffset = isUltraTinyScreen ? 8 : isTinyScreen ? 10 : isSmallScreen ? 12 : 16;
    const sideOffset = isUltraTinyScreen ? 8 : isTinyScreen ? 10 : isSmallScreen ? 14 : 20;
    const outerRadius = isUltraTinyScreen ? 36 : isTinyScreen ? 40 : isSmallScreen ? 44 : 50;
    const innerPaddingH = isUltraTinyScreen ? 3 : isTinyScreen ? 4 : isSmallScreen ? 6 : 8;
    const innerPaddingV = isUltraTinyScreen ? 6 : isTinyScreen ? 7 : isSmallScreen ? 8 : 10;
    const iconSize = isUltraTinyScreen ? 18 : isTinyScreen ? 19 : isSmallScreen ? 21 : 24;
    const labelFontSize = isUltraTinyScreen ? 10 : isTinyScreen ? 11 : isSmallScreen ? 13 : 15;
    const tabPaddingV = isUltraTinyScreen ? 6 : isTinyScreen ? 7 : isSmallScreen ? 8 : 10;
    const tabGap = isUltraTinyScreen ? 2 : isTinyScreen ? 3 : isSmallScreen ? 4 : 6;
    const showActiveLabel = !isTinyScreen;

    return (
        <GlassCard
            style={{
                position: 'absolute',
                bottom: bottomOffset,
                left: sideOffset,
                right: sideOffset,
                borderRadius: outerRadius,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 12,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: innerPaddingH,
                    paddingVertical: innerPaddingV,
                }}
            >
                {TABS.map(({ key, label, Icon }) => {
                    const active = activeTab === key;
                    if (active) {
                        return (
                            <View
                                key={key}
                                style={{ flex: 1, borderRadius: outerRadius, overflow: 'hidden' }}
                            >
                                <GradientPill className="rounded-full">
                                    <Pressable
                                        onPress={handlers[key]}
                                        style={{
                                            flex: 1,
                                            flexDirection: showActiveLabel ? 'row' : 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingVertical: tabPaddingV,
                                            paddingHorizontal: 4,
                                            borderRadius: outerRadius,
                                            gap: tabGap,
                                        }}
                                    >
                                        <Icon size={iconSize} color="#111827" />
                                        {showActiveLabel && (
                                            <Text
                                                style={{
                                                    color: '#111827',
                                                    fontSize: labelFontSize,
                                                    fontFamily: 'Lufga-SemiBold',
                                                }}
                                            >
                                                {label}
                                            </Text>
                                        )}
                                    </Pressable>
                                </GradientPill>
                            </View>
                        );
                    }
                    return (
                        <Pressable
                            key={key}
                            onPress={handlers[key]}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: tabPaddingV,
                                paddingHorizontal: 4,
                                borderRadius: outerRadius,
                                backgroundColor: 'transparent',
                                gap: tabGap,
                            }}
                        >
                            <Icon size={iconSize} color="#94a3b8" />
                        </Pressable>
                    );
                })}
            </View>
        </GlassCard>
    );
}
