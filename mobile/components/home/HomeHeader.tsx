import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '@/lib/authStore';

export function HomeHeader() {
    const { user, logout } = useAuthStore();

    return (
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
            <View>
                <Text className="text-sm text-slate-500">Hi, {user?.name || 'there'}</Text>
                <Text className="text-lg font-bold text-slate-800">
                    Welcome to shop<Text className="text-yellow-500">365</Text>
                </Text>
            </View>
            <Pressable
                className="w-10 h-10 bg-yellow-500 rounded-full items-center justify-center"
                onPress={logout}
            >
                <Text className="text-white font-bold text-sm">👤</Text>
            </Pressable>
        </View>
    );
}
