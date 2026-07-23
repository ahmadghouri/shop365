import { View, Text, Pressable } from 'react-native';

type BottomTabBarProps = {
    onCartPress?: () => void;
    onSupportPress?: () => void;
    onHomePress?: () => void;
    onOrdersPress?: () => void;
    onProfilePress?: () => void;
};

export function BottomTabBar({ onCartPress, onSupportPress, onHomePress, onOrdersPress, onProfilePress }: BottomTabBarProps) {
    return (
        <View className="flex-row border-t border-slate-100 bg-white px-5 py-3">
            <Pressable className="flex-1 items-center" onPress={onCartPress}>
                <Text className="text-lg">🛒</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Cart</Text>
            </Pressable>
            <Pressable className="flex-1 items-center" onPress={onSupportPress}>
                <Text className="text-lg">💬</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Support</Text>
            </Pressable>
            <Pressable className="flex-1 items-center -mt-4" onPress={onHomePress}>
                <View className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center shadow-md shadow-yellow-500/30">
                    <Text className="text-white text-lg">🏠</Text>
                </View>
            </Pressable>
            <Pressable className="flex-1 items-center" onPress={onOrdersPress}>
                <Text className="text-lg">📦</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Orders</Text>
            </Pressable>
            <Pressable className="flex-1 items-center" onPress={onProfilePress}>
                <Text className="text-lg">👤</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Profile</Text>
            </Pressable>
        </View>
    );
}
