import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Package, User, Wallet } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { GradientPill } from './GradientPill';

export type TabKey = 'home' | 'orders' | 'wallet' | 'profile';

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'orders', label: 'Orders', Icon: Package },
    { key: 'wallet', label: 'Wallet', Icon: Wallet },
    { key: 'profile', label: 'Profile', Icon: User },
];

/** Space screens should leave at the bottom so content isn't hidden under the bar. */
export const BOTTOM_NAV_SPACE = 110;

type BottomNavProps = {
    active: TabKey;
    onChange: (key: TabKey) => void;
};

/**
 * Floating glass tab bar — same design as the customer app's BottomTabBar:
 * frosted pill, active tab filled with the yellow gradient.
 */
export function BottomNav({ active, onChange }: BottomNavProps) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const bottomOffset = (isTinyScreen ? 10 : isSmallScreen ? 12 : 16) + insets.bottom;
    const sideOffset = isTinyScreen ? 10 : isSmallScreen ? 14 : 20;
    const radius = isTinyScreen ? 40 : isSmallScreen ? 44 : 50;
    const iconSize = isTinyScreen ? 16 : isSmallScreen ? 17 : 19;
    const labelSize = isTinyScreen ? 9 : isSmallScreen ? 10 : 11;
    const tabPaddingV = isTinyScreen ? 4 : isSmallScreen ? 5 : 6;

    return (
        <GlassCard
            className="p-0"
            style={{
                position: 'absolute',
                bottom: bottomOffset,
                left: sideOffset,
                right: sideOffset,
                borderRadius: radius,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 12,
            }}
        >
            <View className="flex-row items-center" style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
                {TABS.map(({ key, label, Icon }) => {
                    const isActive = key === active;
                    const content = (
                        <Pressable
                            onPress={() => onChange(key)}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: tabPaddingV,
                                paddingHorizontal: 4,
                                gap: 1,
                            }}
                        >
                            <Icon size={iconSize} color={isActive ? '#111827' : '#94a3b8'} />
                            <Text
                                className={isActive ? 'font-semibold' : ''}
                                style={{ color: isActive ? '#111827' : '#94a3b8', fontSize: labelSize }}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    );

                    return isActive ? (
                        <View key={key} style={{ flex: 1, borderRadius: radius, overflow: 'hidden' }}>
                            <GradientPill className="rounded-full">{content}</GradientPill>
                        </View>
                    ) : (
                        <View key={key} style={{ flex: 1 }}>
                            {content}
                        </View>
                    );
                })}
            </View>
        </GlassCard>
    );
}
