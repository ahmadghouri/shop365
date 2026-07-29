import { View, Text, Pressable } from 'react-native';
import { ShoppingCart, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';

type HomeHeaderProps = {
    onCartPress?: () => void;
};

export function HomeHeader({ onCartPress }: HomeHeaderProps) {
    const { user } = useAuthStore();

    return (
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
                <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-3">
                    <MapPin size={22} color="#1e293b" />
                </View>
                <View>
                    <Text className="text-lg font-bold text-slate-900">
                        Hey, {user?.name || 'User'}
                    </Text>
                    <Text className="text-sm text-slate-500">Home address</Text>
                </View>
            </View>
            <Pressable
                className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center"
                onPress={onCartPress}
            >
                <ShoppingCart size={22} color="#1e293b" />
            </Pressable>
        </View>
    );
}
