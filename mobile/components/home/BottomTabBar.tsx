import { View, Text, Pressable } from 'react-native';
import { Home, ListChecks, ClipboardList, User } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';

type BottomTabBarProps = {
    activeTab?: string;
    onHomePress?: () => void;
    onListPress?: () => void;
    onOrdersPress?: () => void;
    onProfilePress?: () => void;
};

export function BottomTabBar({
    activeTab = 'home',
    onHomePress,
    onListPress,
    onOrdersPress,
    onProfilePress,
}: BottomTabBarProps) {
    return (
        <GlassCard
            variant="default"
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl rounded-b-none"
            style={{ height: 92 }}
        >
            <View className="flex-1 flex-row px-5 pt-3 pb-6">
                <Pressable className="flex-1 items-center" onPress={onHomePress}>
                    <Home size={22} color={activeTab === 'home' ? '#EAB308' : '#94a3b8'} />
                    <Text className={`text-xs mt-1 ${activeTab === 'home' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>Home</Text>
                </Pressable>
                <Pressable className="flex-1 items-center" onPress={onListPress}>
                    <ListChecks size={22} color={activeTab === 'list' ? '#EAB308' : '#94a3b8'} />
                    <Text className={`text-xs mt-1 ${activeTab === 'list' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>List</Text>
                </Pressable>
                <Pressable className="flex-1 items-center" onPress={onOrdersPress}>
                    <ClipboardList size={22} color={activeTab === 'orders' ? '#EAB308' : '#94a3b8'} />
                    <Text className={`text-xs mt-1 ${activeTab === 'orders' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>Orders</Text>
                </Pressable>
                <Pressable className="flex-1 items-center" onPress={onProfilePress}>
                    <User size={22} color={activeTab === 'profile' ? '#EAB308' : '#94a3b8'} />
                    <Text className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>Profile</Text>
                </Pressable>
            </View>
        </GlassCard>
    );
}
