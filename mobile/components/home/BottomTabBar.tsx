import { View, Text, Pressable } from 'react-native';
import { Home, ListChecks, ClipboardList, User } from 'lucide-react-native';

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
    const handlers = { home: onHomePress, list: onListPress, orders: onOrdersPress, profile: onProfilePress };

    return (
        <View style={{
            position: 'absolute', bottom: 16, left: 20, right: 20,
            backgroundColor: '#fff',
            borderRadius: 50,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 12,
        }}>
            {TABS.map(({ key, label, Icon }) => {
                const active = activeTab === key;
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
                            backgroundColor: active ? '#1e1e2e' : 'transparent',
                            gap: 6,
                        }}
                    >
                        <Icon size={20} color={active ? '#fff' : '#94a3b8'} />
                        {active && (
                            <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Lufga-SemiBold' }}>
                                {label}
                            </Text>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}
