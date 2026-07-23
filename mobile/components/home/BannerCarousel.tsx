import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useHeaderImages } from '@/lib/queries/useHomeData';
import { API_BASE_URL } from '@/lib/api';

export function BannerCarousel() {
    const { data, isLoading } = useHeaderImages();

    return (
        <View className="mt-5">
            <Text className="text-lg font-bold text-slate-800 px-5 mb-3">What's new</Text>
            {isLoading ? (
                <ActivityIndicator color="#eab308" className="py-4" />
            ) : data && data.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
                    <View className="flex-row">
                        {data.map((img: any) => (
                            <View key={img.id} className="mr-3 rounded-xl overflow-hidden">
                                <Image
                                    source={{ uri: `${API_BASE_URL}/storage/${img.image}` }}
                                    className="w-72 h-36 rounded-xl"
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View className="mx-5 bg-yellow-50 rounded-xl p-6 items-center">
                    <Text className="text-yellow-700 font-medium">Free Delivery on orders above Rs 500!</Text>
                </View>
            )}
        </View>
    );
}
