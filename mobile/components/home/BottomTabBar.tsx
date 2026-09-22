import { Pressable, Text, View } from 'react-native';
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
    const handlers = {
        home: onHomePress,
        list: onListPress,
        orders: onOrdersPress,
        profile: onProfilePress,
    };

    return (
        <GlassCard
            style={{
                position: 'absolute',
                bottom: 16,
                left: 20,
                right: 20,
                borderRadius: 50,
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
                    paddingHorizontal: 8,
                    paddingVertical: 10,
                }}
            >
                {TABS.map(({ key, label, Icon }) => {
                    const active = activeTab === key;
                    if (active) {
                        return (
                            <View
                                key={key}
                                style={{ flex: 1, borderRadius: 50, overflow: 'hidden' }}
                            >
                                <GradientPill className="rounded-full">
                                    <Pressable
                                        onPress={handlers[key]}
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingVertical: 10,
                                            paddingHorizontal: 4,
                                            borderRadius: 50,
                                            gap: 6,
                                        }}
                                    >
                                        <Icon size={24} color="#111827" />
                                        <Text
                                            style={{
                                                color: '#111827',
                                                fontSize: 15,
                                                fontFamily: 'Lufga-SemiBold',
                                            }}
                                        >
                                            {label}
                                        </Text>
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
                                paddingVertical: 10,
                                paddingHorizontal: 4,
                                borderRadius: 50,
                                backgroundColor: 'transparent',
                                gap: 6,
                            }}
                        >
                            <Icon size={24} color="#94a3b8" />
                        </Pressable>
                    );
                })}
            </View>
        </GlassCard>
    );
}
