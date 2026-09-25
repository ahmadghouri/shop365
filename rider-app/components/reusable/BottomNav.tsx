import { Pressable, Text, View } from 'react-native';
import { Home, Package, User, Wallet } from 'lucide-react-native';

export type TabKey = 'home' | 'orders' | 'wallet' | 'profile';

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'orders', label: 'Orders', Icon: Package },
    { key: 'wallet', label: 'Wallet', Icon: Wallet },
    { key: 'profile', label: 'Profile', Icon: User },
];

type BottomNavProps = {
    active: TabKey;
    onChange: (key: TabKey) => void;
};

/** Bottom tab bar. Frosted surface, yellow active state. */
export function BottomNav({ active, onChange }: BottomNavProps) {
    return (
        <View className="flex-row border-t border-white bg-white/70 px-2 pb-6 pt-2">
            {TABS.map(({ key, label, Icon }) => {
                const isActive = key === active;
                return (
                    <Pressable
                        key={key}
                        onPress={() => onChange(key)}
                        className="flex-1 items-center py-1 active:opacity-70"
                    >
                        <Icon size={22} color={isActive ? '#EAB308' : '#94a3b8'} />
                        <Text
                            className={`mt-1 text-[11px] ${
                                isActive ? 'font-bold text-[#b77900]' : 'text-slate-400'
                            }`}
                        >
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
