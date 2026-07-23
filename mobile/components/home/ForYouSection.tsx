import { View, Text } from 'react-native';

export function ForYouSection() {
    return (
        <View className="mt-5 px-5">
            <Text className="text-lg font-bold text-slate-800 mb-3">For you</Text>
            <View className="flex-row gap-3">
                <View className="flex-1 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <Text className="text-sm font-bold text-slate-800">
                        Shop<Text className="text-yellow-500">365</Text>
                    </Text>
                    <Text className="text-xs text-slate-600 mt-1">Groceries delivered with big savings!</Text>
                </View>
                <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="text-sm font-bold text-slate-800">
                        Shop<Text className="text-yellow-500">365</Text>
                    </Text>
                    <Text className="text-xs text-slate-600 mt-1">Your trusted place for everything!</Text>
                </View>
            </View>
        </View>
    );
}
