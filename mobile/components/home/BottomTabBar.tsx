import { View, Text, Pressable } from 'react-native';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react-native';

type BottomTabBarProps = {
    activeTab?: string;
    onHomePress?: () => void;
    onCartPress?: () => void;
    onOrdersPress?: () => void;
    onProfilePress?: () => void;
};

export function BottomTabBar({
    activeTab = 'home',
    onHomePress,
    onCartPress,
    onOrdersPress,
    onProfilePress,
}: BottomTabBarProps) {
    return (
        <View className="absolute bottom-0 left-0 right-0 flex-row bg-white border-t border-slate-100 px-5 py-3 pb-6">
            <Pressable className="flex-1 items-center" onPress={onHomePress}>
                <Home size={22} color={activeTab === 'home' ? '#EAB308' : '#94a3b8'} />
                <Text className={`text-xs mt-1 ${activeTab === 'home' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>Home</Text>
            </Pressable>
            <Pressable className="flex-1 items-center" onPress={onCartPress}>
                <ShoppingCart size={22} color={activeTab === 'cart' ? '#EAB308' : '#94a3b8'} />
                <Text className={`text-xs mt-1 ${activeTab === 'cart' ? 'text-yellow-500 font-medium' : 'text-slate-400'}`}>Cart</Text>
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
    );
}
