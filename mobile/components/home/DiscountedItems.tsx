import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRandomProducts } from '@/lib/queries/useHomeData';
import { API_BASE_URL } from '@/lib/api';

export function DiscountedItems() {
    const { data, isLoading } = useRandomProducts();

    return (
        <View className="mt-5 pb-6">
            <Text className="text-lg font-bold text-slate-800 px-5 mb-3">Discounted Items</Text>
            {isLoading ? (
                <ActivityIndicator color="#eab308" className="py-4" />
            ) : data && data.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
                    <View className="flex-row">
                        {data.slice(0, 10).map((product: any) => (
                            <Pressable key={product.id} className="mr-3 w-40 bg-white rounded-xl border border-slate-100 shadow-sm shadow-black/5 overflow-hidden">
                                <Image
                                    source={{ uri: `${API_BASE_URL}/storage/${product.image}` }}
                                    className="w-full h-28"
                                    resizeMode="cover"
                                />
                                <View className="p-2">
                                    <Text className="text-xs text-slate-800 font-medium" numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        {product.discount_price ? (
                                            <>
                                                <Text className="text-xs font-bold text-yellow-600">
                                                    Rs {product.discount_price}
                                                </Text>
                                                <Text className="text-xs text-slate-400 line-through ml-2">
                                                    Rs {product.price}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text className="text-xs font-bold text-slate-800">
                                                Rs {product.price}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <Text className="px-5 text-sm text-slate-500">No products available</Text>
            )}
        </View>
    );
}
