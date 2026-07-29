import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/authStore';
import { useBusinesses, useHeaderImages, useRandomProducts } from '@/api/home/useHomeQueries';
import { API_BASE_URL } from '@/api/client';

type HomeScreenProps = {
    onCategoryPress?: (id: number, title: string) => void;
};

export function HomeScreen({ onCategoryPress }: HomeScreenProps) {
    const { user, logout } = useAuthStore();
    const businesses = useBusinesses();
    const headerImages = useHeaderImages();
    const randomProducts = useRandomProducts();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
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

                {/* Categories */}
                <View className="px-5 mt-2">
                    {businesses.isLoading ? (
                        <ActivityIndicator color="#eab308" className="py-4" />
                    ) : businesses.data ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row">
                                {businesses.data.map((biz: any) => (
                                    <Pressable
                                        key={biz.id}
                                        className="items-center mr-5"
                                        onPress={() => onCategoryPress?.(biz.id, biz.name)}
                                    >
                                        <View className="w-16 h-16 bg-yellow-50 rounded-full items-center justify-center border border-yellow-200">
                                            {biz.image ? (
                                                <Image
                                                    source={{ uri: `${API_BASE_URL}/storage/${biz.image}` }}
                                                    className="w-10 h-10 rounded-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Text className="text-2xl">🛒</Text>
                                            )}
                                        </View>
                                        <Text className="text-xs text-slate-700 mt-1 font-medium text-center" numberOfLines={1}>
                                            {biz.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    ) : null}
                </View>

                {/* What's New - Banner Carousel */}
                <View className="mt-5">
                    <Text className="text-lg font-bold text-slate-800 px-5 mb-3">What's new</Text>
                    {headerImages.isLoading ? (
                        <ActivityIndicator color="#eab308" className="py-4" />
                    ) : headerImages.data && headerImages.data.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
                            <View className="flex-row">
                                {headerImages.data.map((img: any) => (
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

                {/* For You Section */}
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

                {/* Discounted Items */}
                <View className="mt-5 pb-6">
                    <Text className="text-lg font-bold text-slate-800 px-5 mb-3">Discounted Items</Text>
                    {randomProducts.isLoading ? (
                        <ActivityIndicator color="#eab308" className="py-4" />
                    ) : randomProducts.data && randomProducts.data.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
                            <View className="flex-row">
                                {randomProducts.data.slice(0, 10).map((product: any) => (
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
            </ScrollView>

            {/* Bottom Tab Bar */}
            <View className="flex-row border-t border-slate-100 bg-white px-5 py-3">
                <Pressable className="flex-1 items-center">
                    <Text className="text-lg">🛒</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">Cart</Text>
                </Pressable>
                <Pressable className="flex-1 items-center">
                    <Text className="text-lg">💬</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">Support</Text>
                </Pressable>
                <Pressable className="flex-1 items-center -mt-4">
                    <View className="w-12 h-12 bg-yellow-500 rounded-full items-center justify-center shadow-md shadow-yellow-500/30">
                        <Text className="text-white text-lg">🏠</Text>
                    </View>
                </Pressable>
                <Pressable className="flex-1 items-center">
                    <Text className="text-lg">📦</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">Orders</Text>
                </Pressable>
                <Pressable className="flex-1 items-center">
                    <Text className="text-lg">👤</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">Profile</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
