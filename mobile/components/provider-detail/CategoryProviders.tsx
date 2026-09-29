import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { useProvidersByCategory } from '@/api/provider/useProviderDetail';
import { API_BASE_URL } from '@/api/client';

type CategoryProvidersProps = {
    categoryId: string;
    onProviderPress?: (provider: { id: string; name: string }) => void;
};

/**
 * Providers that belong to a category, filtered on the backend via
 * GET /business?category_id=... . Rendered exactly like the home page's
 * provider strip: horizontal round avatars with the name underneath.
 */
export function CategoryProviders({ categoryId, onProviderPress }: CategoryProvidersProps) {
    const { data: providers = [], isLoading } = useProvidersByCategory(categoryId);

    if (isLoading) {
        return <ActivityIndicator color="#eab308" className="py-4" />;
    }

    if (providers.length === 0) return null;

    return (
        <View className="px-5 mt-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                    {providers.map((biz: any) => (
                        <Pressable
                            key={String(biz._id || biz.id)}
                            className="items-center mr-5"
                            onPress={() =>
                                onProviderPress?.({ id: String(biz._id || biz.id), name: biz.name })
                            }
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
                            <Text
                                className="text-xs text-slate-700 mt-1 font-medium text-center"
                                numberOfLines={1}
                            >
                                {biz.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
